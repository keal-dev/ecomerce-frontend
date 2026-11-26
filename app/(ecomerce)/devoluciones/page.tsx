'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  TbChevronRight,
  TbArrowBackUp,
  TbClock,
  TbCoin,
  TbTruckReturn,
  TbHelpCircle,
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';

export default function DevolucionesPage() {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany(true);
  }, [fetchCompany]);

  const companyName = company?.name || 'Cooperativa Gourmet';
  const email = company?.email || 'soporte@mitienda.com';
  const phone = company?.phone || '+51 999 888 777';

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-5">
          <Link href="/" className="hover:text-[#de2a2a] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Cambios y Devoluciones</span>
        </nav>

        {/* Encabezado */}
        <div className="bg-black text-white rounded-none border-b-4 border-[#de2a2a] p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#de2a2a] text-white rounded-none shrink-0">
              <TbArrowBackUp size={28} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2e9e7b]">
                Garantía y Autenticidad Asegurada
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">
                Política de Cambios y Devoluciones
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1.5">
                Conoce las condiciones, plazos y pasos para devolver o cambiar un producto en {companyName}.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de Garantías en 3 Pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center shrink-0">
              <TbClock size={20} />
            </div>
            <div>
              <h3 className="font-display font-extrabold uppercase text-black text-xs">
                Hasta 7 días
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1">
                Plazo para solicitar cambio o devolución tras recibir tu pedido.
              </p>
            </div>
          </div>

          <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-none bg-[#2e9e7b] text-white flex items-center justify-center shrink-0">
              <TbCoin size={20} />
            </div>
            <div>
              <h3 className="font-display font-extrabold uppercase text-black text-xs">
                Reembolso 100%
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1">
                Devolución directa a tu tarjeta bancaria o cuenta en caso de inconformidad.
              </p>
            </div>
          </div>

          <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-none bg-[#de2a2a] text-white flex items-center justify-center shrink-0">
              <TbTruckReturn size={20} />
            </div>
            <div>
              <h3 className="font-display font-extrabold uppercase text-black text-xs">
                Flete Bonificado
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1">
                Si el producto presenta falla o error de despacho, nosotros asumimos el envío.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Detallado */}
        <div className="bg-white rounded-none border border-[#d9d9d9] p-6 sm:p-10 space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">1</span>
              <h2 className="font-display uppercase tracking-tight">Plazo para Solicitar Cambios o Devoluciones</h2>
            </div>
            <p>
              El cliente cuenta con un plazo máximo de <strong>7 (siete) días calendario</strong> contados a partir de la fecha de recepción del producto para ejercer su derecho a cambio o devolución sin penalidad.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="font-display uppercase tracking-tight">Condiciones y Estado del Producto</h2>
            </div>
            <p>
              Por tratarse de bebidas y productos de consumo humano, para que la solicitud de cambio o devolución sea aceptada el producto debe cumplir obligatoriamente con los siguientes requisitos:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-600">
              <li>El producto o botella debe encontrarse <strong>totalmente sellado, sin abrir y sin señales de manipulación o deterioro en su tapa, sello o precinto</strong>.</li>
              <li>Debe conservar sus <strong>empaques originales, cajas de presentación, etiquetas, sellos de seguridad y accesorios</strong> intactos.</li>
              <li>Presentar el comprobante electrónico de compra (Boleta de Venta o Factura electrónica) o número de orden.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">3</span>
              <h2 className="font-display uppercase tracking-tight">Motivos Válidos para Devolución o Reemplazo</h2>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-600">
              <li><strong>Defecto de origen o embalaje:</strong> Precinto o empaque dañado de origen, derrame o defecto detectado antes de abrir el producto.</li>
              <li><strong>Despacho errado:</strong> Si recibiste un producto, variedad o presentación diferente a la ordenada en la web.</li>
              <li><strong>Producto dañado durante el transporte:</strong> Daño evidente reportado dentro de las primeras 24 a 48 horas de entrega.</li>
              <li><strong>Cambio voluntario:</strong> Sujeto a que el producto conserve sus sellos, precintos y empaques intactos de origen.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">4</span>
              <h2 className="font-display uppercase tracking-tight">Procedimiento para Solicitar la Devolución</h2>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-neutral-600">
              <li>
                <strong>Contacto Inicial:</strong> Comunícate con nuestro canal de soporte al correo <strong>{email}</strong> o vía WhatsApp al <strong>{phone}</strong> indicando tu número de pedido y adjuntando fotos/videos del producto y empaque.
              </li>
              <li>
                <strong>Evaluación Preliminar:</strong> Nuestro equipo revisará la información en un lapso de 24 a 48 horas hábiles y coordinará el recojo o devolución.
              </li>
              <li>
                <strong>Verificación y Aprobación:</strong> Una vez recibido el producto en nuestro centro de distribución, se verificará el estado de los sellos y empaque original.
              </li>
              <li>
                <strong>Ejecución del Cambio o Reembolso:</strong> Se procederá con el despacho del producto de reemplazo o con la devolución dineraria según lo acordado.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">5</span>
              <h2 className="font-display uppercase tracking-tight">Plazos y Métodos de Reembolso del Dinero</h2>
            </div>
            <p>Una vez aprobada la devolución:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-600">
              <li><strong>Pagos con Tarjeta de Crédito/Débito:</strong> La solicitud de extorno se procesa en un plazo de 3 a 5 días hábiles. El reflejo en el estado de cuenta dependerá de los tiempos de tu entidad bancaria (usualmente entre 5 y 15 días hábiles).</li>
              <li><strong>Transferencias Bancarias o Billeteras Digitales (Yape/Plin):</strong> Se efectúa la transferencia en un plazo máximo de 48 horas hábiles tras la aprobación.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-black">
              <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">6</span>
              <h2 className="font-display uppercase tracking-tight">Costos y Gastos de Transporte</h2>
            </div>
            <p>
              Si la devolución o cambio se debe a un error de despacho o daño atribuible a {companyName},{' '}
              <strong>nosotros asumiremos el 100% de los gastos de recojo y reenvío</strong>. Si el cambio se solicita por motivos voluntarios sin error de despacho, el costo logístico de transporte correrá por cuenta del comprador.
            </p>
          </section>

          <div className="p-5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div>
              <p className="font-display font-extrabold uppercase text-black text-xs">
                ¿Necesitas iniciar una solicitud de cambio?
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                Escríbenos a nuestro canal directo de atención con tu número de orden.
              </p>
            </div>
            <Link
              href="/ayuda"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#de2a2a] hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              <TbHelpCircle size={16} />
              Contactar Soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
