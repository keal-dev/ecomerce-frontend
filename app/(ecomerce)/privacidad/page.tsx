'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  TbChevronRight, 
  TbShieldLock, 
  TbLockCheck, 
  TbUserCheck, 
  TbHelpCircle
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';

export default function PrivacidadPage() {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany(true);
  }, [fetchCompany]);

  const companyName = company?.name || 'MercadoAdmin';
  const legalName = company?.legalName || 'Empresa Principal S.A.C.';
  const taxId = company?.taxId || 'RUC registrado';
  const email = company?.email || 'soporte@mitienda.com';
  const address = company?.address || 'Lima, Perú';

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Políticas de Privacidad</span>
        </nav>

        {/* Encabezado */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-[#3483fa] rounded-xl shrink-0">
              <TbShieldLock size={28} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3483fa]">
                Protección y Confidencialidad de Datos
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Políticas de Privacidad
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                Cumplimiento de la Ley de Protección de Datos Personales (Ley N° 29733) en {companyName}.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Legal */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">1. Compromiso de Confidencialidad</h2>
            <p>
              En <strong>{legalName}</strong> (con RUC <strong>{taxId}</strong> y domicilio fiscal en <strong>{address}</strong>), 
              respetamos la privacidad de nuestros usuarios y clientes. Garantizamos que el tratamiento de sus datos personales 
              se realiza con total seguridad, confidencialidad y estricto apego a las disposiciones legales vigentes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">2. Información que Recopilamos</h2>
            <p>
              Recopilamos únicamente los datos necesarios para procesar sus pedidos, emitir comprobantes tributarios (Boleta/Factura) 
              y coordinar la entrega de sus compras:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
              <li>Nombre completo y documento de identidad (DNI / CE / RUC).</li>
              <li>Dirección de despacho y entrega de productos.</li>
              <li>Número de teléfono o celular y correo electrónico para notificaciones del estado del pedido.</li>
            </ul>
            <p className="text-xs text-gray-500 italic">
              Nota: No almacenamos datos sensibles de tarjetas de crédito o débito; todas las transacciones monetarias son procesadas directamente 
              a través de pasarelas de pago homologadas y encriptadas bajo certificación PCI-DSS.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">3. Finalidad del Tratamiento de Datos</h2>
            <p>
              Sus datos personales son utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
              <li>Gestionar y enviar los productos adquiridos.</li>
              <li>Atención al cliente, soporte postventa y gestión de garantías o devoluciones.</li>
              <li>Envío de comprobantes de pago electrónicos y alertas de despacho.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">4. Ejercicio de Derechos ARCO</h2>
            <p>
              El titular de los datos puede ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> 
              remitiendo una solicitud al correo electrónico <strong>{email}</strong> con el asunto &quot;Derechos ARCO - Datos Personales&quot;.
            </p>
          </section>

          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div>
              <p className="font-semibold text-gray-900 text-xs">¿Consultas sobre el tratamiento de tus datos?</p>
              <p className="text-xs text-gray-500 mt-0.5">Escríbenos a {email}.</p>
            </div>
            <Link
              href="/ayuda"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
            >
              <TbHelpCircle size={16} />
              Centro de Ayuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

