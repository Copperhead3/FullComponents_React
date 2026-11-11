import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductoForm from "../components/ProductoForm";
import Estado from "../components/Estado";
import { CartProvider, useCart } from "../context/CartContext";

describe("ProductCard", () => {
  it("muestra nombre, marca, precio en CLP y enlaza al detalle", () => {
    const p = { id: 7, nombre: "Intel i5", categoria: "Procesadores", marca: "Intel", precio: 264990, imagen: "img/a b.jpg" };
    render(<MemoryRouter><ProductCard producto={p} /></MemoryRouter>);
    expect(screen.getByText("Intel i5")).toBeTruthy();
    expect(screen.getByText("Marca: Intel")).toBeTruthy();
    expect(screen.getByText(/264\.990/)).toBeTruthy();
    expect(screen.getByText("Ver producto").getAttribute("href")).toBe("/producto/7");
  });
});

describe("ProductoForm", () => {
  const categorias = [{ id: 2, nombre: "RAM", atributos: [{ id: 9, nombre: "Capacidad", unidad: "GB", tipoDato: "NUMERO" }] }];

  it("no envía y muestra errores con datos inválidos", () => {
    const onGuardar = jasmine.createSpy("onGuardar");
    render(<ProductoForm categorias={categorias} onGuardar={onGuardar} onCancelar={() => {}} />);
    fireEvent.click(screen.getByText("Guardar"));
    expect(screen.getAllByText("Campo obligatorio.").length).toBeGreaterThan(0);
    expect(screen.getByText("Selecciona una categoría.")).toBeTruthy();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it("muestra los atributos de la categoría elegida y envía el producto completo", () => {
    const onGuardar = jasmine.createSpy("onGuardar");
    render(<ProductoForm categorias={categorias} onGuardar={onGuardar} onCancelar={() => {}} />);
    const poner = (label, name, value) => fireEvent.change(screen.getByLabelText(label), { target: { name, value } });
    poner("Nombre", "nombre", "Kingston Fury");
    poner("Marca", "marca", "Kingston");
    poner("Modelo", "modelo", "KF560");
    poner("Descripción", "descripcion", "Memoria DDR5");
    poner("Categoría", "categoriaId", "2");
    poner("Precio (CLP)", "precio", "5000");
    poner("Stock físico", "stockFisico", "3");
    fireEvent.change(screen.getByLabelText("Capacidad (GB)"), { target: { value: "16" } });
    fireEvent.click(screen.getByText("Guardar"));
    expect(onGuardar).toHaveBeenCalledWith(jasmine.objectContaining({
      precio: 5000, stockFisico: 3, categoriaId: 2,
      atributos: [{ idDefinicionAtributo: 9, valor: "16" }],
    }));
  });
});

describe("Estado", () => {
  it("muestra el error y permite reintentar", () => {
    const reintentar = jasmine.createSpy("reintentar");
    render(<Estado cargando={false} error="Falla de red" onReintentar={reintentar} />);
    expect(screen.getByText("Falla de red")).toBeTruthy();
    fireEvent.click(screen.getByText("Reintentar"));
    expect(reintentar).toHaveBeenCalled();
  });
});

describe("CartContext", () => {
  const Prueba = () => {
    const { cantidadTotal, agregar, vaciar } = useCart();
    return (
      <div>
        <span data-testid="n">{cantidadTotal}</span>
        <button onClick={() => agregar({ id: 1, stock: 3 })}>add</button>
        <button onClick={vaciar}>clear</button>
      </div>
    );
  };
  beforeEach(() => localStorage.clear());

  it("agrega respetando el stock, persiste y vacía", () => {
    render(<CartProvider><Prueba /></CartProvider>);
    ["add", "add", "add", "add"].forEach((t) => fireEvent.click(screen.getByText(t)));
    expect(screen.getByTestId("n").textContent).toBe("3");
    expect(JSON.parse(localStorage.getItem("fullcomponents-carrito-v2"))).toEqual([{ id: 1, cantidad: 3 }]);
    fireEvent.click(screen.getByText("clear"));
    expect(screen.getByTestId("n").textContent).toBe("0");
  });
});
