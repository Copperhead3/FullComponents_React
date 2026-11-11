/*
 * Rutas REALES del gateway (8090), tomadas de los controllers y del application.yaml.
 * Usuarios usa el prefijo provisional /usuarios (el gateway lo elimina con StripPrefix=1).
 */
export const E = {
  productos: "/api/v1/productos",
  categorias: "/api/v1/categorias",
  stock: "/api/v1/inventario/stock",
  carritos: "/api/v1/carritos",
  pedidos: "/api/v1/pedidos",
  login: "/usuarios/api/auth/login",
  clientes: "/usuarios/api/clientes",
};
