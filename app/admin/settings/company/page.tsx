import React from 'react';
import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';
import { CompanyManager } from '../_components/CompanyManager';

export const metadata = {
  title: 'Datos de la Empresa & Marca | MercadoAdmin',
  description: 'Gestiona la información legal, logotipo, colores y datos de contacto de tu negocio.',
};

export default function CompanySettingsPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Botón volver a Configuración */}
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#3483fa] transition-colors cursor-pointer group"
        >
          <TbArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a Configuración</span>
        </Link>
      </div>

      {/* Administrador de Datos de la Empresa */}
      <CompanyManager />
    </div>
  );
}
