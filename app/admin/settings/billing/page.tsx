import React from 'react';
import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';
import { BillingSettingsForm } from './_components/BillingSettingsForm';

export const metadata = {
  title: 'Series de Facturación y Comprobantes | MercadoAdmin',
  description: 'Configura las series de Boleta y Factura electrónica SUNAT.',
};

export default function BillingSettingsPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
        >
          <TbArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a Configuración</span>
        </Link>
      </div>

      <BillingSettingsForm />
    </div>
  );
}
