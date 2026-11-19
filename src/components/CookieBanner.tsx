"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "ma-cookie-consent";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function save(value: "accepted" | "rejected") {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* sin almacenamiento: el aviso volverá a mostrarse */
  }
  listeners.forEach((l) => l());
}

/**
 * Aviso de cookies. Aceptar y Rechazar tienen la misma prominencia.
 * Hoy la web NO carga ninguna tecnología no esencial; cuando se añadan
 * analíticas u otros terceros, solo deben cargarse si el valor es "accepted".
 */
export function CookieBanner() {
  const choice = useSyncExternalStore(subscribe, read, () => "pending");
  if (choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-arena bg-white p-5 shadow-lg"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-relaxed">
          Usamos cookies técnicas necesarias para el funcionamiento del sitio. Las cookies no
          esenciales solo se activarán si las aceptas. Más información en la{" "}
          <Link href="/legal/politica-de-cookies" className="underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => save("rejected")}
            className="border border-carbon px-6 py-3 text-sm hover:bg-carbon hover:text-crema"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => save("accepted")}
            className="border border-carbon bg-carbon px-6 py-3 text-sm text-crema hover:bg-black"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
