import React from 'react';
import { ProductsManager } from './_components/ProductsManager';

export const metadata = {
  title: 'Gestión de Productos | MercadoAdmin',
  description: 'Catálogo de productos, control de precios, stock e imágenes.',
};

export default function ProductsPage() {
  return <ProductsManager />;
}
