import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(dir, "..");
const requeridos = ["src/App.jsx", "src/pages/Home.jsx", "src/pages/Catalogo.jsx", "src/pages/Producto.jsx", "src/pages/Carrito.jsx", "src/pages/Checkout.jsx", "src/pages/Login.jsx", "src/pages/admin/UsuariosAdmin.jsx", "src/styles/react-fixes.css", "src/api/index.js", "public/img/sin-imagen.svg"];
let errores = 0;
for (const f of requeridos) { if (!fs.existsSync(path.join(raiz,f))) { console.error("Falta:", f); errores++; } }
const publicDir = path.join(raiz,"public");
const buscar = (d, acumulado=[]) => { for (const e of fs.readdirSync(d,{withFileTypes:true})) { const ruta=path.join(d,e.name); if(e.isDirectory())buscar(ruta,acumulado);else acumulado.push(ruta); } return acumulado; };
const imgs = buscar(path.join(publicDir,"img"));
const js = fs.readFileSync(path.join(raiz,"src/pages/Home.jsx"),"utf8");
for (const [,ref] of js.matchAll(/["'](\/img\/[^"']+)["']/g)) { if (!fs.existsSync(path.join(publicDir,decodeURIComponent(ref.slice(1))))) {console.error("Imagen no encontrada:",ref);errores++;}}
const contract = fs.readFileSync(path.join(raiz,"src/api/endpoints.js"),"utf8");
for(const uri of ["/api/v1/productos","/api/v1/categorias","/api/v1/inventario/stock","/api/v1/carritos","/api/v1/pedidos","/usuarios/api/clientes","/usuarios/api/auth/login"]){if(!contract.includes(uri)){console.error("Ruta ausente:",uri);errores++;}}
console.log(`Archivos revisados; imágenes disponibles: ${imgs.length}. Errores: ${errores}.`);
process.exitCode=errores?1:0;
