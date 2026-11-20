"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initial: LoginState = {};
const inputClass = "mt-2 w-full border border-carbon/40 bg-white px-4 py-3 text-base focus:border-carbon";

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, initial);

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p role="alert" className="border border-red-700 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Correo electrónico
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-carbon px-8 py-3.5 text-sm font-medium tracking-wide text-crema hover:bg-black disabled:opacity-60"
      >
        {isPending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
