import React from 'react';
import { SalesManager } from './_components/SalesManager';

export const metadata = {
  title: 'Punto de Venta (POS) | MercadoAdmin',
  description: 'Ventas directas en tienda física y caja registradora.',
};

export default function AdminSalesPage() {
  return <SalesManager />;
}

