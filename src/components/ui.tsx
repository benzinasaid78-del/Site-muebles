import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12 2xl:px-16 ${className}`}>
      {children}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-200";

const buttonVariants = {
  primary: "bg-carbon text-crema hover:bg-black",
  secondary: "border border-carbon text-carbon hover:bg-carbon hover:text-crema",
  light: "bg-white text-carbon hover:bg-arena",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  external?: boolean;
}) {
  const className = `${buttonBase} ${buttonVariants[variant]}`;
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-madera-oscuro">
            {eyebrow}
          </p>
        )}
        <h2 className="font-heading text-3xl leading-tight sm:text-4xl">{title}</h2>
        {intro && <p className="mt-4 leading-relaxed text-carbon/80">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Marcador de imagen. Se sustituye por next/image con fotografías reales
 * cuando la empresa las suba a la mediateca (Fase 5).
 */
export function ImagePlaceholder({
  label = "Imagen de demostración",
  ratio = "aspect-[4/5]",
  tone = "bg-arena",
  className = "",
}: {
  label?: string;
  ratio?: string;
  tone?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex w-full items-center justify-center ${ratio} ${tone} ${className}`}
    >
      <span className="px-4 text-center text-xs uppercase tracking-[0.15em] text-carbon/50">
        {label}
      </span>
    </div>
  );
}

export function PageIntro({
  title,
  intro,
  eyebrow,
}: {
  title: string;
  intro?: string;
  eyebrow?: string;
}) {
  return (
    <section className="border-b border-arena bg-crema pb-12 pt-16 sm:pb-16 sm:pt-24">
      <Container>
        {eyebrow && (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-madera-oscuro">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl font-heading text-4xl leading-tight sm:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl leading-relaxed text-carbon/80">{intro}</p>}
      </Container>
    </section>
  );
}
