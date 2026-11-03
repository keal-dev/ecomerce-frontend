import React from 'react';
import { PurchasesManager } from './_components/PurchasesManager';

export const metadata = {
  title: 'Compras e Inventario | MercadoAdmin',
  description: 'Gestión de compras a proveedores e ingreso de stock al catálogo.',
};

export default function PurchasesPage() {
  return <PurchasesManager />;
}
