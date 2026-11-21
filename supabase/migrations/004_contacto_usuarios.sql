-- 004: formulario de contacto, listado y gestión de usuarios.
-- Todo con funciones SECURITY DEFINER: no hace falta ninguna clave secreta en Vercel.

-- ---------- Envío público del formulario de contacto ----------
create or replace function public.submit_contact(
  p_name text, p_email text, p_subject text, p_message text, p_privacy boolean
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  n text := btrim(coalesce(p_name, ''));
  e text := lower(btrim(coalesce(p_email, '')));
  s text := btrim(coalesce(p_subject, ''));
  m text := btrim(coalesce(p_message, ''));
begin
  if not coalesce(p_privacy, false) then return 'invalid'; end if;
  if char_length(n) not between 2 and 100 then return 'invalid'; end if;
  if char_length(e) > 254 or e !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then return 'invalid'; end if;
  if char_length(s) not between 3 and 150 then return 'invalid'; end if;
  if char_length(m) not between 10 and 3000 then return 'invalid'; end if;

  -- Límites contra abuso: 3 por correo y hora, 30 en total por hora.
  if (select count(*) from public.contact_submissions
        where lower(email) = e and created_at > now() - interval '1 hour') >= 3 then
    return 'rate_limited';
  end if;
  if (select count(*) from public.contact_submissions
        where created_at > now() - interval '1 hour') >= 30 then
    return 'rate_limited';
  end if;

  insert into public.contact_submissions (name, email, subject, message, privacy_accepted)
  values (n, e, s, m, true);
  return 'ok';
end;
$$;
revoke all on function public.submit_contact(text, text, text, text, boolean) from public;
grant execute on function public.submit_contact(text, text, text, text, boolean) to anon, authenticated;

-- ---------- Listado de usuarios (con correo) solo para quien gestiona usuarios ----------
create or replace function public.admin_list_users()
returns table (
  id uuid, email text, full_name text, role_id text, active boolean,
  created_at timestamptz, last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_permission('users.manage') then
    raise exception 'No autorizado';
  end if;
  return query
    select p.id, u.email::text, p.full_name, p.role_id, p.active, p.created_at, u.last_sign_in_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at;
end;
$$;
revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;

-- ---------- Cambiar rol / activar / desactivar con salvaguardas ----------
create or replace function public.admin_set_user(p_user uuid, p_role text, p_active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_permission('users.manage') then
    raise exception 'No autorizado';
  end if;
  if p_user = (select auth.uid()) then
    raise exception 'No puedes modificar tu propia cuenta';
  end if;
  if p_role is not null and not exists (select 1 from public.roles where id = p_role) then
    raise exception 'Rol no válido';
  end if;
  if p_active and p_role is null then
    raise exception 'Una cuenta activa necesita un rol';
  end if;

  update public.profiles set role_id = p_role, active = p_active where id = p_user;

  if not exists (select 1 from public.profiles where role_id = 'super_admin' and active) then
    raise exception 'Debe quedar al menos un Super Admin activo';
  end if;
end;
$$;
revoke all on function public.admin_set_user(uuid, text, boolean) from public;
grant execute on function public.admin_set_user(uuid, text, boolean) to authenticated;
