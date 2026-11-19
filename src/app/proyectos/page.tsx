import type { Metadata } from "next";
import { ProjectCard } from "@/components/cards";
import { Container, PageIntro } from "@/components/ui";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Proyectos realizados por Muebles Angulo para inspirarte.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageIntro
        eyebrow="Proyectos"
        title="Inspiración para tu hogar"
        intro="Una selección de proyectos terminados."
      />
      <Container className="pt-12 sm:pt-16">
        <ul className="grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
