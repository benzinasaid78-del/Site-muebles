import type { Metadata } from "next";
import { CategoryCard } from "@/components/cards";
import { Container, PageIntro } from "@/components/ui";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Colecciones",
  description: "Explora todas las colecciones de mobiliario y decoración de Muebles Angulo.",
};

export default async function CollectionsPage() {
  const categories = await getCategories();
  return (
    <>
      <PageIntro
        eyebrow="Colecciones"
        title="Todas nuestras colecciones"
        intro="Salones, dormitorios, cocinas y mucho más. Elige una colección para ver sus productos."
      />
      <Container className="pt-12 sm:pt-16">
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <li key={c.id}>
              <CategoryCard category={c} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
