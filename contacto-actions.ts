"use server";

export type ContactState = {
  status: "idle" | "error" | "pending";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "subject" | "message" | "privacy", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validación en servidor del formulario de contacto.
 * AÚN NO guarda ni envía nada: el almacenamiento en `contact_submissions`,
 * la protección antispam real y el límite de peticiones llegan en las
 * Fases 3 y 6. Por eso nunca devuelve "éxito".
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Campo trampa (honeypot): los humanos no lo ven ni lo rellenan.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "pending", message: "Gracias." };
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

  return {
    status: "pending",
    message:
      "El envío del formulario todavía no está activado en esta versión de desarrollo. Por favor, contacta por teléfono o WhatsApp.",
  };
}
