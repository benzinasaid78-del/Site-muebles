"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

/**
 * Inicio de sesión. Mensajes genéricos para no revelar si el correo existe.
 * El límite de intentos lo aplica Supabase Auth (ver docs/SECURITY.md).
 * No se registran contraseñas ni tokens.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Introduce un correo y una contraseña válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Diagnóstico solo en los registros del servidor (Vercel Logs); nunca se muestra al visitante.
    // No se escribe la contraseña ni el correo.
    let host = "?";
    try {
      host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
    } catch {}
    console.error("[login] fallo de Supabase", {
      status: error.status,
      code: error.code,
      message: error.message,
      supabaseHost: host,
      keyPrefix: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").slice(0, 10),
    });
    return { error: "Correo o contraseña incorrectos." };
  }

  // La cuenta debe estar activa y tener rol; si no, se cierra la sesión.
  const profile = await getCurrentProfile();
  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene acceso al panel. Contacta con un administrador." };
  }

  await supabase.from("activity_logs").insert({ user_id: profile.id, action: "auth.login" });
  redirect("/admin");
}
