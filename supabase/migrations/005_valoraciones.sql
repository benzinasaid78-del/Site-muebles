-- 005: valoraciones (1-5 estrellas) de los visitantes en los productos.
alter table public.products
  add column if not exists rating_avg numeric(3,2) not null default 0,
  add column if not exists rating_count integer not null default 0;

create table if not exists public.product_ratings (
  id         bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  voter      text not null,   -- huella (hash) de la cookie del navegador, nunca el dato en claro
  ip_hash    text not null,   -- huella (hash) de la IP, solo para limitar abusos
  stars      smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, voter)
);
create index if not exists product_ratings_ip_idx on public.product_ratings (ip_hash, updated_at);
create index if not exists product_ratings_product_idx on public.product_ratings (product_id);
alter table public.product_ratings enable row level security;
-- Sin políticas: nadie lee ni escribe la tabla directamente; solo la función de abajo.

create or replace function public.rate_product(p_product uuid, p_stars int, p_voter text, p_ip text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  a numeric;
  c integer;
begin
  if p_stars is null or p_stars < 1 or p_stars > 5 then return jsonb_build_object('status','invalid'); end if;
  if char_length(coalesce(p_voter,'')) < 16 or char_length(p_voter) > 128 then return jsonb_build_object('status','invalid'); end if;
  if char_length(coalesce(p_ip,'')) < 16 or char_length(p_ip) > 128 then return jsonb_build_object('status','invalid'); end if;
  if not exists (select 1 from public.products where id = p_product and status = 'published' and deleted_at is null) then
    return jsonb_build_object('status','invalid');
  end if;

  -- Límites contra abuso (básicos): por IP, por producto/IP y global.
  if (select count(*) from public.product_ratings where ip_hash = p_ip and updated_at > now() - interval '1 hour') >= 30 then
    return jsonb_build_object('status','rate_limited');
  end if;
  if not exists (select 1 from public.product_ratings where product_id = p_product and voter = p_voter)
     and (select count(distinct voter) from public.product_ratings
            where product_id = p_product and ip_hash = p_ip and created_at > now() - interval '24 hours') >= 3 then
    return jsonb_build_object('status','rate_limited');
  end if;
  if (select count(*) from public.product_ratings where updated_at > now() - interval '1 hour') >= 300 then
    return jsonb_build_object('status','rate_limited');
  end if;

  insert into public.product_ratings (product_id, voter, ip_hash, stars)
  values (p_product, p_voter, p_ip, p_stars)
  on conflict (product_id, voter)
  do update set stars = excluded.stars, ip_hash = excluded.ip_hash, updated_at = now();

  select round(avg(stars)::numeric, 2), count(*) into a, c
  from public.product_ratings where product_id = p_product;

  update public.products set rating_avg = coalesce(a, 0), rating_count = c where id = p_product;
  return jsonb_build_object('status','ok','avg', coalesce(a,0), 'count', c);
end;
$$;
revoke all on function public.rate_product(uuid, int, text, text) from public;
grant execute on function public.rate_product(uuid, int, text, text) to anon, authenticated;
