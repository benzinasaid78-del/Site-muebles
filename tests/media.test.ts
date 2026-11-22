import { describe, expect, it } from "vitest";
import { cleanFileName, detectImage } from "@/lib/media";

const bytes = (...n: number[]) => new Uint8Array(n);

describe("detectImage", () => {
  it("reconoce JPEG", () => {
    expect(detectImage(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe("image/jpeg");
  });
  it("reconoce PNG", () => {
    expect(detectImage(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe("image/png");
  });
  it("reconoce WEBP", () => {
    const b = bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50);
    expect(detectImage(b)?.mime).toBe("image/webp");
  });
  it("rechaza HTML y SVG disfrazados de imagen", () => {
    expect(detectImage(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    expect(detectImage(new TextEncoder().encode("<html><script>alert(1)</script>"))).toBeNull();
  });
  it("rechaza archivos vacíos o demasiado cortos", () => {
    expect(detectImage(new Uint8Array(0))).toBeNull();
    expect(detectImage(bytes(0xff, 0xd8))).toBeNull();
  });
});

describe("cleanFileName", () => {
  it("elimina rutas", () => {
    expect(cleanFileName("../../etc/passwd")).toBe("passwd");
    expect(cleanFileName("C:\\fotos\\sofa.jpg")).toBe("sofa.jpg");
  });
  it("elimina caracteres de control y limita longitud", () => {
    expect(cleanFileName("a\u0000b.jpg")).toBe("ab.jpg");
    expect(cleanFileName("x".repeat(500)).length).toBe(120);
  });
});
