'use client';

import React, { useState } from 'react';
import { TbChevronDown, TbHelp, TbSparkles, TbX } from 'react-icons/tb';
import { HelpCategoryType } from './HelpCategoryCards';

export interface FaqItem {
  id: string;
  category: 'shipping' | 'payments' | 'returns' | 'account';
  categoryLabel: string;
  question: string;
  answer: string;
  tags: string[];
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'shipping',
    categoryLabel: 'Compras y Delivery',
    question: '¿Cómo puedo rastrear mi pedido o saber dónde está mi compra?',
    answer:
      'Una vez confirmada tu orden, recibirás una notificación de estado. También puedes pulsar en el enlace "Rastrear pedido" en cualquier momento ingresando tu número de pedido para ver la trazabilidad en tiempo real.',
    tags: ['rastrear', 'pedido', 'compra', 'seguimiento', 'envio'],
  },
  {
    id: 'faq-2',
    category: 'shipping',
    categoryLabel: 'Compras y Delivery',
    question: '¿Cuánto tardan los envíos y cómo obtengo Envío Gratis o EXPRESS?',
    answer:
      'Los envíos locales en Lima se entregan el mismo día o entre 24 y 48 horas hábiles. Para compras marcadas con «Envío gratis» o productos «EXPRESS» (o pedidos desde S/ 99), el costo de delivery es cubierto por la tienda.',
    tags: ['tiempo', 'plazo', 'envio gratis', 'full', 'express', 'costo'],
  },
  {
    id: 'faq-3',
    category: 'shipping',
    categoryLabel: 'Compras y Delivery',
    question: '¿Qué sucede si no me encuentro en casa cuando llegue el repartidor?',
    answer:
      'El servicio de mensajería se pondrá en contacto contigo mediante el teléfono registrado en tu orden y realizará hasta dos intentos de entrega. Por normativa vigente, la recepción de bebidas alcohólicas requiere validar mayoría de edad (+18).',
    tags: ['entrega', 'ausente', 'repartidor', 'visita'],
  },
  {
    id: 'faq-4',
    category: 'payments',
    categoryLabel: 'Pagos y Facturación',
    question: '¿Cuáles son los medios de pago aceptados?',
    answer:
      'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias directas y billeteras digitales (Yape, Plin) a través de Culqi. Todos los pagos son procesados con encriptación SSL de grado bancario.',
    tags: ['medios de pago', 'tarjeta', 'yape', 'plin', 'transferencia', 'credito', 'debito'],
  },
  {
    id: 'faq-5',
    category: 'payments',
    categoryLabel: 'Pagos y Facturación',
    question: '¿Puedo solicitar Boleta o Factura electrónica con RUC?',
    answer:
      'Sí. Durante el proceso de pago puedes seleccionar el tipo de comprobante que requieres (Boleta o Factura). Si necesitas Factura, sólo debes ingresar tu número de RUC y Razón Social.',
    tags: ['boleta', 'factura', 'ruc', 'comprobante', 'impuesto', 'facturacion'],
  },
  {
    id: 'faq-6',
    category: 'payments',
    categoryLabel: 'Pagos y Facturación',
    question: '¿Es seguro pagar en esta plataforma?',
    answer:
      'Totalmente seguro. No almacenamos los datos sensibles de tus tarjetas. Todas las transacciones se realizan bajo los más estrictos estándares de seguridad informática y protocolos PCI-DSS.',
    tags: ['seguridad', 'proteccion', 'tarjeta', 'confiable'],
  },
  {
    id: 'faq-7',
    category: 'returns',
    categoryLabel: 'Garantía y Devolución',
    question: '¿Cómo funciona la garantía de autenticidad y las devoluciones?',
    answer:
      'Todos nuestros vinos, chocolates, derivados del cacao y cafés cuentan con garantía de origen y empaque sellado. Si el producto no coincide con tu orden, presenta daños de transporte o falla de origen, te devolvemos el 100% de tu dinero dentro de los 7 días calendario posteriores a la entrega.',
    tags: ['compra protegida', 'devolucion', 'reembolso', 'garantia', 'cambio'],
  },
  {
    id: 'faq-8',
    category: 'returns',
    categoryLabel: 'Garantía y Devolución',
    question: '¿Cuánto tiempo tarda en reflejarse mi reembolso?',
    answer:
      'Una vez aprobado el reembolso, si pagaste con billetera digital (Yape/Plin) se acredita de manera inmediata. Si utilizaste tarjeta de crédito o débito, la acreditación demora entre 2 y 15 días hábiles según la entidad bancaria emisora.',
    tags: ['tiempo reembolso', 'dinero', 'plazo', 'banco', 'devolucion'],
  },
  {
    id: 'faq-9',
    category: 'account',
    categoryLabel: 'Cuenta y Seguridad',
    question: '¿Cómo cambio mi contraseña o actualizo mis datos personales?',
    answer:
      'Puedes ingresar a tu perfil desde la esquina superior derecha haciendo clic en tu nombre o avatar. En la sección de perfil podrás actualizar tu correo, teléfono y contraseña de acceso.',
    tags: ['contraseña', 'perfil', 'datos', 'cambiar', 'cuenta', 'clave'],
  },
  {
    id: 'faq-10',
    category: 'account',
    categoryLabel: 'Cuenta y Seguridad',
    question: '¿Qué hago si sospecho de una actividad inusual en mi cuenta?',
    answer:
      'Te recomendamos cambiar tu contraseña de inmediato y comunicarte con nuestro canal de atención por WhatsApp o correo electrónico para verificar tus accesos.',
    tags: ['seguridad', 'alerta', 'hackeo', 'sospecha'],
  },
];

interface HelpFaqAccordionProps {
  selectedCategory: HelpCategoryType;
  searchQuery: string;
  onClearSearch?: () => void;
}

export const HelpFaqAccordion = ({
  selectedCategory,
  searchQuery,
  onClearSearch,
}: HelpFaqAccordionProps) => {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-4']);

  const isSearching = Boolean(searchQuery.trim());

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!isSearching) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      faq.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div
      id="faq-section"
      className="bg-white rounded-none border border-[#d9d9d9] p-6 sm:p-8 mb-10 scroll-mt-24"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#d9d9d9] pb-4 mb-6 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <TbSparkles className="text-[#de2a2a]" size={20} />
          <h2 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-black">
            {isSearching ? 'Resultados de búsqueda' : 'Preguntas Frecuentes'}
          </h2>
          {isSearching && (
            <span className="text-xs bg-black text-white font-bold px-2.5 py-0.5 rounded-none">
              &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'resultado' : 'resultados'}
          </span>
          {isSearching && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="text-xs text-[#de2a2a] hover:text-red-700 font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
            >
              <TbX size={14} />
              <span>Limpiar filtro</span>
            </button>
          )}
        </div>
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-10 bg-[#f8f8f8] border border-[#d9d9d9]">
          <div className="w-12 h-12 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-3">
            <TbHelp size={24} />
          </div>
          <h3 className="font-display text-sm font-extrabold uppercase text-black">
            No encontramos respuestas para &quot;{searchQuery}&quot;
          </h3>
          <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
            Prueba buscando con palabras clave más sencillas (ej. <i>envío</i>, <i>pago</i>, <i>factura</i>, <i>devolución</i>).
          </p>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-4 px-5 py-2 bg-[#de2a2a] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors cursor-pointer"
            >
              Ver todas las preguntas
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = isSearching || openIds.includes(faq.id);

            return (
              <div
                key={faq.id}
                className="border border-[#d9d9d9] rounded-none overflow-hidden transition-colors hover:border-black"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left bg-[#f8f8f8] hover:bg-neutral-100 transition-colors cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-none shrink-0">
                      {faq.categoryLabel}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-black">
                      {faq.question}
                    </span>
                  </div>
                  <TbChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#de2a2a]' : 'text-neutral-500'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-neutral-700 leading-relaxed border-t border-[#d9d9d9] animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
