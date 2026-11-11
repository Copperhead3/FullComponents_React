// Validaciones de formularios (puras, probadas en tests).
export function validarRut(rut) {
  const limpio = String(rut).replace(/[.\-\s]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  let suma = 0, mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dv === esperado;
}

export const validarEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());
export const validarTelefono = (t) => /^\+?56?\s?9\d{8}$/.test(String(t).replace(/\s/g, "")) || /^9\d{8}$/.test(String(t).replace(/\s/g, ""));

export function validarTarjeta({ numero, vencimiento, cvv }, ahora = new Date()) {
  const errores = {};
  if (!/^\d{16}$/.test(String(numero).replace(/\s/g, ""))) errores.numero = "El número debe tener 16 dígitos.";
  const m = /^(\d{2})\/(\d{2})$/.exec(vencimiento);
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) errores.vencimiento = "Usa el formato MM/AA.";
  else if (new Date(2000 + Number(m[2]), Number(m[1]), 1) <= ahora) errores.vencimiento = "La tarjeta está vencida.";
  if (!/^\d{3}$/.test(String(cvv))) errores.cvv = "El CVV debe tener 3 dígitos.";
  return errores;
}
