import Image from "next/image";
import Link from "next/link";
import type { Category, Product, Project } from "@/lib/data";
import { ImagePlaceholder } from "./ui";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/colecciones/${category.slug}`} className="group block">
      <div className="overflow-hidden">
        {category.cover ? (
          <div className="relative aspect-[4/5] bg-arena">
            <Image
              src={category.cover.url}
              alt={category.cover.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <ImagePlaceholder
            label={category.name}
            ratio="aspect-[4/5]"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <h3 className="mt-4 font-heading text-xl group-hover:underline">{category.name}</h3>
    </Link>
  );
}

export function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const image = product.images?.[0];
  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="overflow-hidden bg-white">
        {image ? (
          <div className="relative aspect-square bg-white">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
              className="object-contain p-3 transition-transform sm:p-4 duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <ImagePlaceholder
            label="Foto próximamente"
            ratio="aspect-square"
            tone="bg-white"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-4">
        {categoryName && (
          <p className="text-xs uppercase tracking-[0.15em] text-madera-oscuro">{categoryName}</p>
        )}
        <h3 className="mt-1 font-heading text-lg leading-snug group-hover:underline">
          {product.name}
        </h3>
        {product.brand && <p className="mt-1 text-sm text-carbon/70">{product.brand}</p>}
        <p className="mt-2 text-sm leading-relaxed text-carbon/80">{product.shortDescription}</p>
        {product.showPrice && product.price !== undefined && (
          <p className="mt-2 text-sm font-medium">
            {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
              product.price,
            )}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/proyectos/${project.slug}`} className="group block">
      <div className="overflow-hidden">
        {project.cover ? (
          <div className="relative aspect-[4/3] bg-arena">
            <Image
              src={project.cover.url}
              alt={project.cover.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <ImagePlaceholder
            label="Foto próximamente"
            ratio="aspect-[4/3]"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-madera-oscuro">
        {project.category}
      </p>
      <h3 className="mt-1 font-heading text-xl group-hover:underline">{project.title}</h3>
    </Link>
  );
}
