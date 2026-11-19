import Link from "next/link";
import type { Category, Product, Project } from "@/lib/data";
import { ImagePlaceholder } from "./ui";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/colecciones/${category.slug}`} className="group block">
      <div className="overflow-hidden">
        <ImagePlaceholder
          label={`Portada: ${category.name}`}
          ratio="aspect-[4/5]"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
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
  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="overflow-hidden bg-white">
        <ImagePlaceholder
          label="Foto del producto"
          ratio="aspect-square"
          tone="bg-white"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
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
        <ImagePlaceholder
          label="Foto del proyecto"
          ratio="aspect-[4/3]"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-madera-oscuro">
        {project.category}
      </p>
      <h3 className="mt-1 font-heading text-xl group-hover:underline">{project.title}</h3>
    </Link>
  );
}
