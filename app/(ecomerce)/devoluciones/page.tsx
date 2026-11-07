'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  TbChevronRight, 
  TbArrowBackUp, 
  TbChecklist, 
  TbClock, 
  TbCoin, 
  TbTruckReturn, 
  TbAlertCircle,
  TbHelpCircle
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';

export default function DevolucionesPage() {
  const { company, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany(true);
  }, [fetchCompany]);

  const companyName = company?.name || 'MercadoAdmin';
  const email = company?.email || 'soporte@mitienda.com';
  const phone = company?.phone || '+51 999 888 777';

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Cambios y Devoluciones</span>
        </nav>

        {/* Encabezado */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <TbArrowBackUp size={28} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Garantía y Satisfacción Asegurada
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Política de Cambios y Devoluciones
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                Conoce las condiciones, plazos y pasos para devolver o cambiar un producto en {companyName}.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de Garantías en 3 Pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#3483fa] flex items-center justify-center shrink-0">
              <TbClock size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xs">Hasta 7 días</h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Plazo para solicitar cambio o devolución tras recibir tu pedido.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TbCoin size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xs">Reembolso 100%</h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Devolución directa a tu tarjeta bancaria o cuenta en caso de inconformidad.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TbTruckReturn size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xs">Flete Bonificado</h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Si el producto presenta falla o error de despacho, nosotros asumimos el envío.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Detallado */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-gray-700 leading-relaxed">
          {/* 1. Plazo */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">1</span>
              <h2>Plazo para Solicitar Cambios o Devoluciones</h2>
            </div>
            <p>
              El cliente cuenta con un plazo máximo de <strong>7 (siete) días calendario</strong> contados a partir de la fecha de recepción del producto 
              para ejercer su derecho a cambio o devolución sin penalidad.
            </p>
          </section>

          {/* 2. Requisitos */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">2</span>
              <h2>Condiciones y Estado del Producto</h2>
            </div>
            <p>
              Para que la solicitud de cambio o devolución sea aceptada, el producto debe cumplir obligatoriamente con los siguientes requisitos:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
              <li>El producto debe encontrarse <strong>completamente nuevo, sin uso y sin señales de desgaste o deterioro</strong>.</li>
              <li>Debe conservar sus <strong>empaques originales, etiquetas, sellos de seguridad, manuales y todos los accesorios</strong> incluidos.</li>
              <li>Presentar el comprobante electrónico de compra (Boleta de Venta o Factura electrónica) o número de orden.</li>
            </ul>
          </section>

          {/* 3. Motivos Válidos */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">3</span>
              <h2>Motivos Válidos para Devolución o Reemplazo</h2>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
              <li><strong>Falla o defecto de fábrica:</strong> Mal funcionamiento técnico dentro del periodo de garantía.</li>
              <li><strong>Despacho errado:</strong> Si recibiste un producto, color o modelo diferente al ordenado en la web.</li>
              <li><strong>Paquete o producto dañado durante el transporte:</strong> Daño evidente reportado dentro de las primeras 48 horas de entrega.</li>
              <li><strong>Cambio de opinión o retracto:</strong> Sujeto a que el producto esté sellado de fábrica y sin abrir.</li>
            </ul>
          </section>

          {/* 4. Proceso Paso a Paso */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">4</span>
              <h2>Procedimiento para Solicitar la Devolución</h2>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
              <li>
                <strong>Contacto Inicial:</strong> Comunícate con nuestro canal de soporte al correo <strong>{email}</strong> o vía WhatsApp al <strong>{phone}</strong> indicando tu número de pedido y adjuntando fotos/videos del producto y empaque.
              </li>
              <li>
                <strong>Evaluación Preliminar:</strong> Nuestro equipo de calidad revisará la información en un lapso de 24 a 48 horas hábiles y te brindará una guía de devolución o dirección de envío.
              </li>
              <li>
                <strong>Inspección Técnica y Aprobación:</strong> Una vez recibido el artículo en nuestro centro de distribución, se realizará una breve inspección técnica para corroborar el estado del mismo.
              </li>
              <li>
                <strong>Ejecución del Cambio o Reembolso:</strong> Se procederá con el despacho del producto de reemplazo o con la emisión de la nota de crédito / devolución dineraria según lo acordado.
              </li>
            </ol>
          </section>

          {/* 5. Tiempos de Reembolso */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">5</span>
              <h2>Plazos y Métodos de Reembolso del Dinero</h2>
            </div>
            <p>
              Una vez aprobada la devolución:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
              <li><strong>Pagos con Tarjeta de Crédito/Débito:</strong> La solicitud de extorno se procesa en un plazo de 3 a 5 días hábiles. El reflejo en el estado de cuenta dependerá de los tiempos de tu entidad bancaria (usualmente entre 5 y 15 días hábiles).</li>
              <li><strong>Transferencias Bancarias o Billeteras Digitales (Yape/Plin):</strong> Se efectúa la transferencia en un plazo máximo de 48 horas hábiles tras la aprobación.</li>
            </ul>
          </section>

          {/* 6. Costos de Envío */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs">6</span>
              <h2>Costos y Gastos de Transporte</h2>
            </div>
            <p>
              Si la devolución o cambio se debe a una falla de fábrica, desperfecto o error atribuible a {companyName}, 
              <strong> nosotros asumiremos el 100% de los gastos de recojo y reenvío</strong>. Si el cambio se solicita por motivos ajenos 
              (preferencia de color, cambio voluntario sin falla), el costo logístico de transporte correrá por cuenta del comprador.
            </p>
          </section>

          {/* Caja de Contacto Rápido */}
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div>
              <p className="font-semibold text-gray-900 text-xs">¿Necesitas iniciar una solicitud de cambio?</p>
              <p className="text-xs text-gray-500 mt-0.5">Escríbenos a nuestro canal directo de atención con tu número de orden.</p>
            </div>
            <Link
              href="/ayuda"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
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

