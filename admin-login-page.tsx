import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acceso al panel",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getCurrentProfile()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-crema px-5 py-12">
      <div className="w-full max-w-sm">
        <p className="font-heading text-2xl tracking-[0.12em]">MUEBLES ANGULO</p>
        <h1 className="mt-6 font-heading text-3xl">Acceso al panel</h1>
        <p className="mt-2 text-sm text-carbon/70">Solo para personal autorizado.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
