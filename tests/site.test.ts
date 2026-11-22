import { describe, expect, it } from "vitest";
import { pending, whatsappLink } from "@/lib/site";

describe("pending", () => {
  it("muestra el dato si existe", () => {
    expect(pending("Calle Mayor 1", "dirección")).toBe("Calle Mayor 1");
  });
  it("marca como PENDIENTE si falta, sin inventar nada", () => {
    expect(pending(null, "horario")).toBe("[PENDIENTE: horario]");
  });
});

describe("whatsappLink", () => {
  it("devuelve null si no hay número", () => {
    expect(whatsappLink(null, "Hola")).toBeNull();
  });
  it("codifica el mensaje", () => {
    expect(whatsappLink("34600000000", "Hola, ¿qué tal?")).toBe(
      "https://wa.me/34600000000?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F",
    );
  });
});
