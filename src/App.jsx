import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Ofertas from "./pages/Ofertas";
import RutaAdmin from "./components/RutaAdmin";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Producto from "./pages/Producto";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import MisPedidos from "./pages/MisPedidos";
import AdminLayout from "./pages/admin/AdminLayout";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/producto/:id" element={<Producto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/admin/*" element={<RutaAdmin><AdminLayout /></RutaAdmin>} />
        <Route path="*" element={<main className="container py-5"><h1>Página no encontrada</h1></main>} />
      </Routes>
      <Footer />
    </>
  );
}
