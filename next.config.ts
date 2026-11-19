import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Fase 3: añadir aquí el host de Supabase Storage en images.remotePatterns.
  // Fase 6: cabeceras de seguridad y Content Security Policy.
};

export default nextConfig;
