import type { Metadata } from "next";
import Image from "next/image";
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
  const gallery = project.images && project.images.length > 0 ? project.images : project.cover ? [project.cover] : [];

  return (
    <>
      <PageIntro eyebrow={project.category} title={project.title} intro={project.description} />
      <Container className="pt-12 sm:pt-16">
        {gallery.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2">
            {gallery.map((img, i) => (
              <li key={img.url} className="relative aspect-[4/3] bg-arena">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        ) : (
          <ImagePlaceholder label="Fotos próximamente" ratio="aspect-[4/3]" />
        )}
      </Container>
    </>
  );
}
