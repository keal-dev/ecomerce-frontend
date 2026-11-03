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
  // Compras y Envíos
  {
    id: 'faq-1',
    category: 'shipping',
    categoryLabel: 'Compras y Envíos',
    question: '¿Cómo puedo rastrear mi pedido o saber dónde está mi compra?',
    answer:
      'Una vez confirmada tu orden, recibirás una notificación de estado. También puedes pulsar en el enlace superior "¿Dónde está tu compra? / Rastrea tu pedido" en cualquier momento ingresando tu número de pedido para ver la trazabilidad en tiempo real.',
    tags: ['rastrear', 'pedido', 'compra', 'seguimiento', 'envio'],
  },
  {
    id: 'faq-2',
    category: 'shipping',
    categoryLabel: 'Compras y Envíos',
    question: '¿Cuánto tardan los envíos y cómo obtengo Envío Gratis o FULL?',
    answer:
      'Los envíos locales se entregan generalmente entre 24 y 48 horas hábiles. Para compras marcadas con la insignia «Envío gratis» o productos «FULL», el costo de envío es cubierto por la tienda a partir del monto mínimo indicado en la publicación.',
    tags: ['tiempo', 'plazo', 'envio gratis', 'full', 'costo'],
  },
  {
    id: 'faq-3',
    category: 'shipping',
    categoryLabel: 'Compras y Envíos',
    question: '¿Qué sucede si no me encuentro en casa cuando llegue el repartidor?',
    answer:
      'El servicio de mensajería realizará hasta dos intentos de entrega y se pondrá en contacto contigo mediante el teléfono registrado en tu orden. Si ambos intentos no son exitosos, el paquete quedará disponible para recojo en sucursal.',
    tags: ['entrega', 'ausente', 'repartidor', 'visita'],
  },

  // Pagos y Facturación
  {
    id: 'faq-4',
    category: 'payments',
    categoryLabel: 'Pagos y Facturación',
    question: '¿Cuáles son los medios de pago aceptados?',
    answer:
      'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias directas, y billeteras digitales (Yape, Plin). Todos los pagos son procesados con encriptación SSL de grado bancario.',
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

  // Garantía y Devolución
  {
    id: 'faq-7',
    category: 'returns',
    categoryLabel: 'Garantía y Devolución',
    question: '¿Cómo funciona la Compra Protegida y las devoluciones?',
    answer:
      'Cuentas con garantía de Compra Protegida: si el producto no coincide con la descripción, presenta fallas de fábrica o no llega, te devolvemos el 100% de tu dinero. Tienes hasta 7 días calendario posteriores a la entrega para solicitar la devolución sin costo.',
    tags: ['compra protegida', 'devolucion', 'reembolso', 'garantia', 'cambio'],
  },
  {
    id: 'faq-8',
    category: 'returns',
    categoryLabel: 'Garantía y Devolución',
    question: '¿Cuánto tiempo tarda en reflejarse mi reembolso?',
    answer:
      'Una vez aprobado el reembolso, si pagaste con billetera digital (Yape/Plin) se acredita de manera inmediata. Si utilizaste tarjeta de crédito o débito, la acreditación demora entre 2 y 5 días hábiles según la entidad bancaria emisora.',
    tags: ['tiempo reembolso', 'dinero', 'plazo', 'banco', 'devolucion'],
  },

  // Cuenta y Seguridad
  {
    id: 'faq-9',
    category: 'account',
    categoryLabel: 'Cuenta y Seguridad',
    question: '¿Cómo cambio mi contraseña o actualizo mis datos personales?',
    answer:
      'Puedes ingresar a tu perfil desde la esquina superior derecha haciendo clic en tu nombre o avatar. En la sección «Mi perfil» podrás actualizar tu correo, teléfono, direcciones de entrega y contraseña de acceso.',
    tags: ['contraseña', 'perfil', 'datos', 'cambiar', 'cuenta', 'clave'],
  },
  {
    id: 'faq-10',
    category: 'account',
    categoryLabel: 'Cuenta y Seguridad',
    question: '¿Qué hago si sospecho de una actividad inusual en mi cuenta?',
    answer:
      'Te recomendamos cambiar tu contraseña de inmediato y comunicarte con nuestro canal de atención por WhatsApp o correo electrónico para verificar tus accesos y bloquear temporalmente cualquier movimiento dudoso.',
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

  // Filtrar por categoría y término de búsqueda
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
      className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 sm:p-8 mb-10 scroll-mt-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-2">
        <div className="flex items-center gap-2">
          <TbSparkles className="text-[#3483fa]" size={22} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            {isSearching ? 'Resultados de búsqueda' : 'Preguntas Frecuentes'}
          </h2>
          {isSearching && (
            <span className="text-xs bg-blue-50 text-[#3483fa] font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
              &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-light">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'resultado' : 'resultados'}
          </span>
          {isSearching && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <TbX size={14} />
              <span>Limpiar filtro</span>
            </button>
          )}
        </div>
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <TbHelp size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">
            No encontramos respuestas para &quot;{searchQuery}&quot;
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Prueba buscando con palabras clave más sencillas (ej. <i>envío</i>, <i>pago</i>, <i>factura</i>, <i>devolución</i>).
          </p>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Ver todas las preguntas
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            // Si el usuario está buscando, abrir automáticamente las respuestas que coinciden
            const isOpen = isSearching || openIds.includes(faq.id);

            return (
              <div
                key={faq.id}
                className="border border-gray-200/80 rounded-xl overflow-hidden transition-all duration-200 hover:border-gray-300"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#3483fa] px-2 py-0.5 rounded border border-blue-100 shrink-0">
                      {faq.categoryLabel}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                      {faq.question}
                    </span>
                  </div>
                  <TbChevronDown
                    size={18}
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#3483fa]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-gray-600 leading-relaxed font-light border-t border-gray-100 animate-in fade-in duration-150">
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
