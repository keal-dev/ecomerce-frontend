'use client';

import React, { useState } from 'react';
import {
  TbBrandWhatsapp,
  TbMail,
  TbMapPin,
  TbClock,
  TbSend,
  TbCircleCheck,
} from 'react-icons/tb';
import { Company } from '@/types/company.types';

interface HelpContactChannelsProps {
  company: Company | null;
}

export const HelpContactChannels = ({ company }: HelpContactChannelsProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const phone = company?.phone || '+51 999 888 777';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const email = company?.email || 'soporte@mitienda.com';
  const address = company?.address || 'Lima, Perú';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        orderNumber: '',
        subject: 'general',
        message: '',
      });
    }, 700);
  };

  return (
    <div className="bg-white rounded-none border border-[#d9d9d9] p-6 sm:p-8">
      <div className="mb-6 pb-4 border-b border-[#d9d9d9]">
        <h2 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight text-black">
          ¿Aún necesitas ayuda? Contáctanos
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Nuestro equipo de atención al cliente está listo para resolver tus dudas de inmediato.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Canales de contacto directos */}
        <div className="lg:col-span-5 space-y-4">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${cleanPhone}?text=Hola,%20necesito%20ayuda%20con%20mi%20compra`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-none border border-[#2e9e7b]/40 bg-[#2e9e7b]/5 hover:border-[#2e9e7b] transition-all group"
          >
            <div className="w-12 h-12 rounded-none bg-[#2e9e7b] text-white flex items-center justify-center shrink-0">
              <TbBrandWhatsapp size={26} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2e9e7b]">
                Atención vía WhatsApp
              </span>
              <p className="text-sm font-extrabold text-black">{phone}</p>
              <span className="text-[11px] text-neutral-600 font-medium">
                Respuesta inmediata →
              </span>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}?subject=Consulta%20desde%20Centro%20de%20Ayuda`}
            className="flex items-center gap-4 p-4 rounded-none border border-[#d9d9d9] bg-[#f8f8f8] hover:border-black transition-all group"
          >
            <div className="w-12 h-12 rounded-none bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-brand-accent transition-colors">
              <TbMail size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Correo Electrónico
              </span>
              <p className="text-sm font-extrabold text-black">{email}</p>
              <span className="text-[11px] text-brand-accent font-bold">
                Escríbenos en cualquier momento →
              </span>
            </div>
          </a>

          {/* Horario y Ubicación */}
          <div className="p-4 rounded-none border border-[#d9d9d9] bg-[#f8f8f8] space-y-3">
            <div className="flex items-start gap-3">
              <TbClock size={18} className="text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black">
                  Horario de atención
                </p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Lunes a Sábado: 8:30 AM – 7:30 PM (Domingos hasta las 2:00 PM)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-[#d9d9d9]">
              <TbMapPin size={18} className="text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black">
                  Oficina Principal
                </p>
                <p className="text-[11px] text-neutral-600 mt-0.5">{address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de consulta rápida */}
        <div className="lg:col-span-7 bg-[#f8f8f8] rounded-none p-5 sm:p-6 border border-[#d9d9d9]">
          <h3 className="font-display text-sm font-extrabold uppercase tracking-tight text-black mb-1">
            Envíanos un mensaje directo
          </h3>
          <p className="text-xs text-neutral-600 mb-4">
            Te responderemos al correo o teléfono indicado a la brevedad.
          </p>

          {submitted ? (
            <div className="p-6 bg-[#2e9e7b]/10 rounded-none border border-[#2e9e7b] text-center animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-none bg-[#2e9e7b] text-white flex items-center justify-center mx-auto mb-2.5">
                <TbCircleCheck size={28} />
              </div>
              <h4 className="font-display text-sm font-extrabold uppercase text-black">
                ¡Mensaje recibido con éxito!
              </h4>
              <p className="text-xs text-neutral-700 mt-1 max-w-xs mx-auto">
                Hemos asignado tu consulta a un asesor. Te contactaremos pronto.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-accent underline cursor-pointer"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Tu nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d9d9d9] rounded-none outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d9d9d9] rounded-none outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Motivo de contacto
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d9d9d9] rounded-none outline-none focus:border-black"
                  >
                    <option value="general">Consulta general</option>
                    <option value="shipping">Estado o rastreo de envío</option>
                    <option value="returns">Cambio o devolución</option>
                    <option value="billing">Facturación o boleta</option>
                    <option value="other">Otro asunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    N° de Pedido (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    placeholder="Ej. ORD-2026-4821"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#d9d9d9] rounded-none outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  ¿Cómo podemos ayudarte? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detalla tu consulta aquí..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#d9d9d9] rounded-none outline-none focus:border-black resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer disabled:opacity-50"
              >
                <TbSend size={15} />
                <span>{isSending ? 'Enviando consulta...' : 'Enviar mensaje'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
