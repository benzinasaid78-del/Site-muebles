"use client";

import { useState, useTransition } from "react";
import { rateProduct } from "@/app/productos/rating-actions";

function StarShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 2.5l2.95 6.1 6.7.9-4.9 4.65 1.2 6.65L12 17.5l-5.95 3.3 1.2-6.65-4.9-4.65 6.7-.9L12 2.5z" />
    </svg>
  );
}

function Star({ fill }: { fill: number }) {
  return (
    <span className="relative block h-5 w-5">
      <StarShape className="absolute inset-0 h-5 w-5 text-carbon/20" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${Math.round(fill * 100)}%` }}>
        <StarShape className="h-5 w-5 text-madera" />
      </span>
    </span>
  );
}

/**
 * Valoración de 5 estrellas. Muestra la media real de los visitantes (nunca inventada) y deja
 * valorar con un toque. Sin valoraciones aparece vacía.
 */
export function RatingStars({
  productId,
  name,
  avg,
  count,
}: {
  productId: string;
  name: string;
  avg: number;
  count: number;
}) {
  const [state, setState] = useState({ avg, count });
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [hover, setHover] = useState(0);
  const [pending, startTransition] = useTransition();

  function vote(stars: number) {
    setMsg(null);
    startTransition(async () => {
      const r = await rateProduct(productId, stars);
      if (r.ok) {
        setState({ avg: r.avg, count: r.count });
        setMsg({ text: `Gracias por tu valoración (${stars}/5).`, error: false });
      } else {
        setMsg({ text: r.message, error: true });
      }
    });
  }

  const shown = hover > 0 ? hover : state.avg;
  const label =
    state.count > 0
      ? `${state.avg.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · ${state.count} ${state.count === 1 ? "valoración" : "valoraciones"}`
      : "Sé el primero en valorar";

  return (
    <div className="flex flex-col items-end">
      <div
        role="group"
        aria-label={`Valorar ${name}`}
        className="flex items-center"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            onClick={() => vote(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            aria-label={`Valorar con ${n} ${n === 1 ? "estrella" : "estrellas"}`}
            className="-mx-0.5 flex h-8 w-7 items-center justify-center disabled:opacity-60"
          >
            <Star fill={Math.max(0, Math.min(1, shown - (n - 1)))} />
          </button>
        ))}
      </div>
      <p className="text-xs text-carbon/70" aria-live="polite">
        {label}
      </p>
      {msg && (
        <p role={msg.error ? "alert" : "status"} className={`mt-1 text-xs ${msg.error ? "text-red-800" : "text-carbon/80"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
