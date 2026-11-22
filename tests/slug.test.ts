import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(slugify("Sofás y Colchones")).toBe("sofas-y-colchones");
  });
  it("colapsa símbolos y recorta guiones", () => {
    expect(slugify("  --Mesa & Silla!!  ")).toBe("mesa-silla");
  });
  it("limita la longitud a 80", () => {
    expect(slugify("a".repeat(200)).length).toBe(80);
  });
  it("devuelve cadena vacía si no hay caracteres válidos", () => {
    expect(slugify("¡¿?!")).toBe("");
  });
});
