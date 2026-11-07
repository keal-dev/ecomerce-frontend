'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  TbChevronRight, 
  TbFileText, 
  TbShieldCheck, 
  TbCreditCard, 
  TbTruckDelivery, 
  TbScale,
  TbHelpCircle
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';

export default function TerminosYCondicionesPage() {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany(true);
  }, [fetchCompany]);

  const companyName = company?.name || 'MercadoAdmin';
  const legalName = company?.legalName || 'Empresa Principal S.A.C.';
  const taxId = company?.taxId || 'RUC registrado';
  const email = company?.email || 'soporte@mitienda.com';
  const phone = company?.phone || '+51 999 888 777';
  const address = company?.address || 'Lima, Perú';
  const currencySymbol = company?.currencySymbol || 'S/';

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Términos y Condiciones</span>
        </nav>

        {/* Encabezado */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand/30 text-gray-900 rounded-xl shrink-0">
              <TbFileText size={28} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3483fa]">
                Marco Legal y Condiciones de Compra
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                Última actualización: {new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Legal Estructurado */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-gray-700 leading-relaxed">
          {/* 1. Identificación */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">1</span>
              <h2>Identificación de la Empresa y Titularidad</h2>
            </div>
            <p>
              El presente sitio web es operado y administrado por <strong>{legalName}</strong> (en adelante, <strong>&quot;{companyName}&quot;</strong>), 
              con identificación tributaria / RUC <strong>{taxId}</strong>, domicilio fiscal ubicado en <strong>{address}</strong>, 
              correo electrónico de contacto <strong>{email}</strong> y teléfono <strong>{phone}</strong>.
            </p>
            <p>
              El acceso, navegación y utilización de esta tienda electrónica atribuye la condición de usuario e implica la aceptación plena y sin reservas 
              de todas las disposiciones incluidas en estos Términos y Condiciones.
            </p>
          </section>

          {/* 2. Capacidad Legal */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">2</span>
              <h2>Capacidad para Comprar y Registro</h2>
            </div>
            <p>
              Los servicios y productos ofrecidos en esta plataforma están disponibles únicamente para personas que tengan capacidad legal para contratar 
              (mayores de 18 años). Quienes no cumplan con esta condición deberán actuar a través de sus padres, tutores o apoderados legales.
            </p>
          </section>

          {/* 3. Precios, Moneda e Impuestos */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">3</span>
              <h2>Precios, Moneda e Impuestos</h2>
            </div>
            <p>
              Todos los precios de los productos exhibidos en la tienda se expresan en moneda nacional ({currencySymbol} - Soles) e <strong>incluyen 
              todos los impuestos de ley aplicables (IGV)</strong>. Los precios no incluyen gastos de envío ni costos por servicios adicionales, los cuales 
              serán debidamente desglosados e informados al usuario antes de confirmar la compra.
            </p>
            <p>
              {companyName} se reserva el derecho de modificar los precios en cualquier momento sin previo aviso; no obstante, los pedidos ya procesados 
              y confirmados se respetarán con el precio vigente al momento de la orden.
            </p>
          </section>

          {/* 4. Métodos de Pago y Seguridad */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">4</span>
              <h2>Medios de Pago y Seguridad de las Transacciones</h2>
            </div>
            <p>
              Los pagos en la plataforma se procesan a través de pasarelas de pago seguras y certificadas que garantizan la confidencialidad de los datos 
              bancarios bajo estándares internacionales de seguridad y cifrado SSL.
            </p>
            <p>
              Se aceptan tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias y billeteras electrónicas. 
              {companyName} no almacena datos de tarjetas de crédito o débito de los clientes en sus servidores.
            </p>
          </section>

          {/* 5. Despacho y Entrega */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">5</span>
              <h2>Despacho, Plazos y Condiciones de Entrega</h2>
            </div>
            <p>
              Los productos adquiridos serán entregados en la dirección indicada por el usuario al realizar su compra. La cobertura de despacho 
              y los tiempos de entrega varían según la localidad geográfica del destinatario, cumpliéndose habitualmente dentro de los plazos 
              estimados informados en el resumen del pedido.
            </p>
            <p>
              El receptor debe verificar el estado exterior del paquete al momento de la recepción y firmar la conformidad correspondiente.
            </p>
          </section>

          {/* 6. Garantía de Productos */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">6</span>
              <h2>Garantía Legal de los Productos</h2>
            </div>
            <p>
              Todos los artículos comercializados cuentan con garantía legal por defectos de fábrica. Para conocer el procedimiento detallado 
              de cambios, sustituciones y devoluciones, por favor consulta nuestra{' '}
              <Link href="/devoluciones" className="text-[#3483fa] font-semibold hover:underline">
                Política de Cambios y Devoluciones
              </Link>.
            </p>
          </section>

          {/* 7. Ley Aplicable y Jurisdicción */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">7</span>
              <h2>Legislación Aplicable y Jurisdicción</h2>
            </div>
            <p>
              Los presentes Términos y Condiciones se rigen e interpretan de conformidad con las leyes vigentes de la República del Perú 
              (Código de Protección y Defensa del Consumidor - Ley N° 29571). Cualquier controversia derivada del uso del sitio será sometida 
              a los jueces y tribunales competentes.
            </p>
          </section>

          {/* Caja de Contacto Rápido */}
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div>
              <p className="font-semibold text-gray-900 text-xs">¿Tienes dudas sobre los términos o tu compra?</p>
              <p className="text-xs text-gray-500 mt-0.5">Nuestro equipo de atención al cliente está a tu disposición.</p>
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

