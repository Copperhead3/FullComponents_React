import { validarEmail, validarRut, validarTarjeta, validarTelefono } from "../utils/validar";

describe("validar", () => {
  it("acepta un RUT válido con y sin formato", () => {
    expect(validarRut("12.345.678-5")).toBeTrue();
    expect(validarRut("123456785")).toBeTrue();
  });
  it("rechaza un RUT con dígito verificador incorrecto", () => expect(validarRut("12.345.678-9")).toBeFalse());
  it("valida correos", () => {
    expect(validarEmail("a@b.cl")).toBeTrue();
    expect(validarEmail("sin-arroba")).toBeFalse();
  });
  it("valida teléfonos chilenos", () => {
    expect(validarTelefono("912345678")).toBeTrue();
    expect(validarTelefono("+56 9 1234 5678")).toBeTrue();
    expect(validarTelefono("12345")).toBeFalse();
  });
  it("detecta tarjeta vencida y datos incompletos", () => {
    const ahora = new Date(2026, 10, 9);
    expect(validarTarjeta({ numero: "4111111111111111", vencimiento: "12/29", cvv: "123" }, ahora)).toEqual({});
    expect(validarTarjeta({ numero: "4111111111111111", vencimiento: "01/25", cvv: "123" }, ahora).vencimiento).toBeDefined();
    expect(Object.keys(validarTarjeta({ numero: "1", vencimiento: "x", cvv: "1" }, ahora)).length).toBe(3);
  });
});
