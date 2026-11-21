import type { ReactNode } from "react";

const inputClass =
  "mt-2 w-full border border-carbon/40 bg-white px-4 py-3 text-base focus:border-carbon";

type Common = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
};

function Wrapper({ name, label, error, hint, children }: Common & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {hint && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-carbon/70">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField(
  props: Common & { defaultValue?: string; required?: boolean; maxLength?: number; type?: string },
) {
  const { name, label, error, hint, defaultValue, required, maxLength, type } = props;
  return (
    <Wrapper name={name} label={label} error={error} hint={hint}>
      <input
        id={name}
        name={name}
        type={type ?? "text"}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? `${name}-hint` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined}
        className={inputClass}
      />
    </Wrapper>
  );
}

export function TextArea(
  props: Common & { defaultValue?: string; rows?: number; maxLength?: number },
) {
  const { name, label, error, hint, defaultValue, rows, maxLength } = props;
  return (
    <Wrapper name={name} label={label} error={error} hint={hint}>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows ?? 4}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? `${name}-hint` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined}
        className={inputClass}
      />
    </Wrapper>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-5 accent-carbon" />
      {label}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-red-700 px-4 py-3 text-sm text-red-800">
      {message}
    </p>
  );
}

export const primaryButton =
  "bg-carbon px-8 py-3.5 text-sm font-medium tracking-wide text-crema hover:bg-black disabled:opacity-60";
export const secondaryButton =
  "border border-carbon px-6 py-3 text-sm hover:bg-carbon hover:text-crema";
