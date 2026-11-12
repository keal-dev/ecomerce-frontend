import React from 'react';
import { OrdersManager } from './_components/OrdersManager';

export const metadata = {
  title: 'Pedidos Online | MercadoAdmin',
  description: 'Gestión y despacho de pedidos realizados desde la tienda virtual.',
};

export default function AdminOrdersPage() {
  return <OrdersManager />;
}

