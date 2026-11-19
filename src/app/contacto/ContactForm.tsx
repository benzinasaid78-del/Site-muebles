"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitContact, type ContactState } from "./actions";

const initial: ContactState = { status: "idle" };

const inputClass =
  "mt-2 w-full border border-carbon/40 bg-white px-4 py-3 text-base focus:border-carbon";

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, action, isPending] = useActionState(submitContact, initial);
  const e = state.errors ?? {};

  return (
    <form action={action} noValidate className="space-y-6">
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`border px-4 py-3 text-sm ${
            state.status === "error" ? "border-red-700 text-red-800" : "border-carbon/30"
          }`}
        >
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="name" className="text-sm font-medium">Nombre</label>
        <input id="name" name="name" type="text" autoComplete="name" required maxLength={100}
          aria-invalid={!!e.name} aria-describedby={e.name ? "name-err" : undefined} className={inputClass} />
        {e.name && <p id="name-err" className="mt-1 text-sm text-red-800">{e.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254}
          aria-invalid={!!e.email} aria-describedby={e.email ? "email-err" : undefined} className={inputClass} />
        {e.email && <p id="email-err" className="mt-1 text-sm text-red-800">{e.email}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="text-sm font-medium">Asunto</label>
        <input id="subject" name="subject" type="text" required maxLength={150} defaultValue={defaultSubject}
          aria-invalid={!!e.subject} aria-describedby={e.subject ? "subject-err" : undefined} className={inputClass} />
        {e.subject && <p id="subject-err" className="mt-1 text-sm text-red-800">{e.subject}</p>}
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">Mensaje</label>
        <textarea id="message" name="message" rows={6} required maxLength={3000}
          aria-invalid={!!e.message} aria-describedby={e.message ? "message-err" : undefined} className={inputClass} />
        {e.message && <p id="message-err" className="mt-1 text-sm text-red-800">{e.message}</p>}
      </div>

      {/* Honeypot antispam: oculto a personas y a lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">No rellenar</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="privacy" required className="mt-1 h-4 w-4"
            aria-invalid={!!e.privacy} aria-describedby={e.privacy ? "privacy-err" : undefined} />
          <span>
            He leído y acepto la{" "}
            <Link href="/legal/politica-de-privacidad" className="underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        {e.privacy && <p id="privacy-err" className="mt-1 text-sm text-red-800">{e.privacy}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex bg-carbon px-8 py-3.5 text-sm font-medium tracking-wide text-crema hover:bg-black disabled:opacity-60"
      >
        {isPending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
