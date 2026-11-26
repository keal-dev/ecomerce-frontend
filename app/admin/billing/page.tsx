import React from 'react';
import { BillingManager } from './_components/BillingManager';

export const metadata = {
  title: 'Facturación Electrónica SUNAT | Panel Admin',
  description: 'Gestión y emisión de Boletas y Facturas electrónicas mediante Facturalo.pe',
};

export default function AdminBillingPage() {
  return <BillingManager />;
}

