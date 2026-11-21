"use server";

import { createPublicClient } from "@/lib/supabase/public";

export type ContactState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "subject" | "message" | "privacy", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida en el servidor y guarda el mensaje con la función `submit_contact`
 * de la base de datos (que repite la validación y limita el abuso).
 * Solo devuelve "success" si el mensaje se guardó de verdad.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Campo trampa (honeypot): los humanos no lo ven ni lo rellenan.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success", message: "Gracias. Hemos recibido tu mensaje." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const privacy = formData.get("privacy") === "on";

  const errors: NonNullable<ContactState["errors"]> = {};
  if (name.length < 2 || name.length > 100) errors.name = "Indica tu nombre (2-100 caracteres).";
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "Indica un correo válido.";
  if (subject.length < 3 || subject.length > 150) errors.subject = "Indica un asunto (3-150 caracteres).";
  if (message.length < 10 || message.length > 3000) errors.message = "El mensaje debe tener entre 10 y 3000 caracteres.";
  if (!privacy) errors.privacy = "Debes aceptar la política de privacidad.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, message: "Revisa los campos marcados." };
  }

  try {
    const { data, error } = await createPublicClient().rpc("submit_contact", {
      p_name: name,
      p_email: email,
      p_subject: subject,
      p_message: message,
      p_privacy: privacy,
    });
    if (error) throw error;
    if (data === "ok") {
      return { status: "success", message: "Gracias. Hemos recibido tu mensaje y te responderemos lo antes posible." };
    }
    if (data === "rate_limited") {
      return { status: "error", message: "Has enviado demasiados mensajes. Inténtalo de nuevo más tarde o llámanos." };
    }
    return { status: "error", message: "Revisa los campos del formulario." };
  } catch (e) {
    console.error("[contacto] no se pudo guardar", e instanceof Error ? e.message : e);
    return {
      status: "error",
      message: "No hemos podido enviar tu mensaje. Inténtalo de nuevo o contacta por teléfono o WhatsApp.",
    };
  }
}
