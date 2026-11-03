'use client';

import React, { useState } from 'react';
import {
  TbBrandWhatsapp,
  TbMail,
  TbPhone,
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

    // Simular envío de consulta con feedback inmediato
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
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          ¿Aún necesitas ayuda? Contáctanos
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
          Nuestro equipo de atención al cliente está listo para resolver tus dudas de inmediato
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
            className="flex items-center gap-4 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <TbBrandWhatsapp size={26} />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800">
                Atención vía WhatsApp
              </span>
              <p className="text-sm font-semibold text-gray-900">{phone}</p>
              <span className="text-[11px] text-emerald-600 font-medium">
                Respuesta casi inmediata →
              </span>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}?subject=Consulta%20desde%20Centro%20de%20Ayuda`}
            className="flex items-center gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#3483fa] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <TbMail size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-800">
                Correo Electrónico
              </span>
              <p className="text-sm font-semibold text-gray-900">{email}</p>
              <span className="text-[11px] text-blue-600 font-medium">
                Escríbenos en cualquier momento →
              </span>
            </div>
          </a>

          {/* Horario y Ubicación */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/80 space-y-3">
            <div className="flex items-start gap-3">
              <TbClock size={18} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-800">Horario de atención</p>
                <p className="text-[11px] text-gray-500">
                  Lunes a Sábado: 8:30 AM – 7:30 PM (Domingos hasta las 2:00 PM)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-gray-200/60">
              <TbMapPin size={18} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-800">Oficina Principal</p>
                <p className="text-[11px] text-gray-500">{address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de consulta rápida */}
        <div className="lg:col-span-7 bg-gray-50/60 rounded-xl p-5 sm:p-6 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            Envíanos un mensaje directo
          </h3>
          <p className="text-xs text-gray-500 font-light mb-4">
            Te responderemos al correo o teléfono indicado a la brevedad.
          </p>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
                <TbCircleCheck size={28} />
              </div>
              <h4 className="text-sm font-bold text-emerald-900">
                ¡Mensaje recibido con éxito!
              </h4>
              <p className="text-xs text-emerald-700 mt-1 max-w-xs mx-auto">
                Hemos asignado tu consulta a un asesor. Te contactaremos pronto.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-semibold text-emerald-800 underline cursor-pointer"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Tu nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#3483fa]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#3483fa]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Motivo de contacto
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#3483fa]"
                  >
                    <option value="general">Consulta general</option>
                    <option value="shipping">Estado o rastreo de envío</option>
                    <option value="returns">Cambio o devolución</option>
                    <option value="billing">Facturación o boleta</option>
                    <option value="other">Otro asunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    N° de Pedido (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    placeholder="Ej. #PED-4821"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#3483fa]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  ¿Cómo podemos ayudarte? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detalla tu consulta aquí..."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#3483fa] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
