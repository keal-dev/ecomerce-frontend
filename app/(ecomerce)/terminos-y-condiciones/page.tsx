'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  TbChevronRight,
  TbFileText,
  TbHelpCircle,
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';

export default function TerminosYCondicionesPage() {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany(true);
  }, [fetchCompany]);

  const companyName = company?.name || 'Cooperativa Gourmet';
  const legalName = company?.legalName || 'Empresa Principal S.A.C.';
  const taxId = company?.taxId || 'RUC registrado';
  const email = company?.email || 'soporte@mitienda.com';
  const phone = company?.phone || '+51 999 888 777';
  const address = company?.address || 'Lima, Perú';
  const currencySymbol = company?.currencySymbol || 'S/';

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-5">
          <Link href="/" className="hover:text-[#de2a2a] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Términos y Condiciones</span>
        </nav>

        {/* Encabezado */}
        <div className="bg-black text-white rounded-none border-b-4 border-[#de2a2a] p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#de2a2a] text-white rounded-none shrink-0">
              <TbFileText size={28} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#de2a2a]">
                Marco Legal y Condiciones de Compra
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1.5">
                Última actualización: {new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Legal Estructurado */}
        <div className="bg-white rounded-none border border-[#d9d9d9] p-6 sm:p-10 space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">1</span>
              <h2 className="font-display uppercase tracking-tight">Identificación de la Empresa y Titularidad</h2>
            </div>
            <p>
              El presente sitio web es operado y administrado por <strong>{legalName}</strong> (en adelante, <strong>&quot;{companyName}&quot;</strong>), con identificación tributaria / RUC <strong>{taxId}</strong>, domicilio fiscal ubicado en <strong>{address}</strong>, correo electrónico de contacto <strong>{email}</strong> y teléfono <strong>{phone}</strong>.
            </p>
            <p>
              El acceso, navegación y utilización de esta tienda electrónica atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en estos Términos y Condiciones.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="font-display uppercase tracking-tight">Mayoría de Edad y Venta Responsable (+18)</h2>
            </div>
            <p>
              Conforme a la <strong>Ley N° 28681</strong> que regula la comercialización, consumo y publicidad de bebidas alcohólicas, la compra y recepción de bebidas alcohólicas en esta plataforma está estrictamente reservada para personas <strong>mayores de 18 años</strong>. Nuestro equipo de delivery podrá solicitar el DNI físico al momento de la entrega para verificar la identidad y edad del receptor.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">3</span>
              <h2 className="font-display uppercase tracking-tight">Precios, Moneda e Impuestos</h2>
            </div>
            <p>
              Todos los precios de los productos exhibidos en la tienda se expresan en moneda nacional ({currencySymbol} - Soles) e <strong>incluyen todos los impuestos de ley aplicables (IGV)</strong>. Los precios no incluyen gastos de envío ni costos por servicios adicionales, los cuales serán debidamente desglosados e informados al usuario antes de confirmar la compra.
            </p>
            <p>
              {companyName} se reserva el derecho de modificar los precios en cualquier momento sin previo aviso; no obstante, los pedidos ya procesados y confirmados se respetarán con el precio vigente al momento de la orden.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">4</span>
              <h2 className="font-display uppercase tracking-tight">Medios de Pago y Seguridad de las Transacciones</h2>
            </div>
            <p>
              Los pagos en la plataforma se procesan a través de pasarelas de pago seguras y certificadas que garantizan la confidencialidad de los datos bancarios bajo estándares internacionales de seguridad y cifrado SSL.
            </p>
            <p>
              Se aceptan tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias y billeteras electrónicas (Yape/Plin). {companyName} no almacena datos de tarjetas de crédito o débito de los clientes en sus servidores.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">5</span>
              <h2 className="font-display uppercase tracking-tight">Despacho, Plazos y Condiciones de Entrega</h2>
            </div>
            <p>
              Los productos adquiridos serán entregados en la dirección indicada por el usuario al realizar su compra. La cobertura de despacho y los tiempos de entrega varían según la localidad geográfica del destinatario, cumpliéndose habitualmente dentro de los plazos estimados informados en el resumen del pedido.
            </p>
            <p>
              El receptor debe verificar el estado exterior del paquete y los sellos de los productos al momento de la recepción.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">6</span>
              <h2 className="font-display uppercase tracking-tight">Garantía de Origen y Calidad</h2>
            </div>
            <p>
              Todos nuestros vinos, chocolates, derivados del cacao y cafés son elaborados y envasados bajo estrictos estándares de calidad y trazabilidad. Para conocer el procedimiento detallado de cambios, sustituciones y devoluciones, por favor consulta nuestra{' '}
              <Link href="/devoluciones" className="text-[#de2a2a] font-bold hover:underline">
                Política de Cambios y Devoluciones
              </Link>.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">7</span>
              <h2 className="font-display uppercase tracking-tight">Legislación Aplicable y Jurisdicción</h2>
            </div>
            <p>
              Los presentes Términos y Condiciones se rigen e interpretan de conformidad con las leyes vigentes de la República del Perú (Código de Protección y Defensa del Consumidor - Ley N° 29571). Cualquier controversia derivada del uso del sitio será sometida a los jueces y tribunales competentes.
            </p>
          </section>

          <div className="p-5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div>
              <p className="font-display font-extrabold uppercase text-black text-xs">
                ¿Tienes dudas sobre los términos o tu compra?
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                Nuestro equipo de atención al cliente está a tu disposición.
              </p>
            </div>
            <Link
              href="/ayuda"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#de2a2a] hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
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
