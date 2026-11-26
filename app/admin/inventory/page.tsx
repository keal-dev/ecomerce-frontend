import React from 'react';
import { InventoryManager } from './_components/InventoryManager';

export const metadata = {
  title: 'Inventario y Kardex | Panel Admin',
  description: 'Control físico de almacén, valorización de existencias, alertas de stock crítico y movimientos de Kardex.',
};

export default function AdminInventoryPage() {
  return <InventoryManager />;
}

