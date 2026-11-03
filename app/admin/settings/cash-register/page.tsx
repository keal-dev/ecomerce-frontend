import React from 'react';
import { CashRegisterManager } from './_components/CashRegisterManager';

export const metadata = {
  title: 'Apertura y Cierre de Caja | MercadoAdmin',
  description: 'Control de fondo de caja, arqueos diarios y cierre de turnos.',
};

export default function CashRegisterPage() {
  return <CashRegisterManager />;
}
