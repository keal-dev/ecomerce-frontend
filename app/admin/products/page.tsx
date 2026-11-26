import React from 'react';
import { ProductsManager } from './_components/ProductsManager';

export const metadata = {
  title: 'Gestión de Productos | Panel Admin',
  description: 'Catálogo de productos, control de precios, stock e imágenes.',
};

export default function ProductsPage() {
  return <ProductsManager />;
}
