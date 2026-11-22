"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { createActionClient } from "@/lib/supabase/public";

const input = z.object({ productId: z.string().uuid(), stars: z.number().int().min(1).max(5) });

export type RateResult =
  | { ok: true; avg: number; count: number }
  | { ok: false; message: string };

const sha = (v: string) => createHash("sha256").update(`ma-rating:${v}`).digest("hex");

/**
 * Registra (o cambia) la valoración de un visitante. Anónima: se identifica por una cookie
 * propia y se limita por IP (ambas solo como huella/hash). La base de datos valida y limita el abuso.
 */
export async function rateProduct(productId: string, stars: number): Promise<RateResult> {
  const parsed = input.safeParse({ productId, stars });
  if (!parsed.success) return { ok: false, message: "Valoración no válida." };

  const jar = await cookies();
  let voter = jar.get("ma_voter")?.value;
  if (!voter || !/^[0-9a-f-]{36}$/i.test(voter)) {
    voter = randomUUID();
    jar.set("ma_voter", voter, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "desconocida").trim();

  try {
    const { data, error } = await createActionClient().rpc("rate_product", {
      p_product: parsed.data.productId,
      p_stars: parsed.data.stars,
      p_voter: sha(voter),
      p_ip: sha(ip),
    });
    if (error) throw error;
    const r = data as { status?: string; avg?: number | string; count?: number } | null;
    if (r?.status === "ok") {
      revalidatePath("/", "layout");
      return { ok: true, avg: Number(r.avg ?? 0) || 0, count: r.count ?? 0 };
    }
    if (r?.status === "rate_limited") {
      return { ok: false, message: "Demasiadas valoraciones seguidas. Inténtalo más tarde." };
    }
    return { ok: false, message: "No se pudo registrar la valoración." };
  } catch (e) {
    console.error("[valoraciones] error", e instanceof Error ? e.message : e);
    return { ok: false, message: "No se pudo registrar la valoración. Inténtalo de nuevo." };
  }
}
