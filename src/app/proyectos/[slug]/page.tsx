import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, ImagePlaceholder, PageIntro } from "@/components/ui";
import { getProject } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <>
      <PageIntro eyebrow={project.category} title={project.title} intro={project.description} />
      <Container className="pt-12 sm:pt-16">
        <ul className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <li key={n}>
              <ImagePlaceholder label={`Foto ${n} del proyecto (demostración)`} ratio="aspect-[4/3]" />
            </li>
          ))}
        </ul>
        {/* Antes y después: se activará cuando el proyecto tenga ambas imágenes (Fase 5). */}
      </Container>
    </>
  );
}
