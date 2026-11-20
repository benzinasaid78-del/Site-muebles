import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteChrome } from "@/components/SiteChrome";
import { site } from "@/lib/site";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Muebles Angulo | Mobiliario y decoración en Barbastro",
    template: "%s | Muebles Angulo",
  },
  description:
    "Muebles y decoración para el hogar en Barbastro, Huesca. Descubre nuestras colecciones y proyectos.",
  // Contenido de demostración: NO indexar hasta tener datos reales (Fase 9).
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${lora.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <SiteChrome header={<Header />} footer={<Footer />} banner={<CookieBanner />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
