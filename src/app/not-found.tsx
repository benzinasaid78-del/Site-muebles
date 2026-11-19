import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <h1 className="font-heading text-4xl">Página no encontrada</h1>
      <p className="mt-4 text-carbon/80">La página que buscas no existe o ha cambiado de dirección.</p>
      <div className="mt-8">
        <ButtonLink href="/">Volver al inicio</ButtonLink>
      </div>
    </Container>
  );
}
