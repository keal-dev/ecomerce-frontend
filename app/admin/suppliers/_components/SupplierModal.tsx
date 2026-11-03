'use client';

import React, { useState, useEffect } from 'react';
import {
  TbX,
  TbBuildingStore,
  TbCheck,
  TbLoader2,
  TbAlertCircle,
  TbPhone,
  TbMail,
  TbUser,
  TbMapPin,
  TbId,
} from 'react-icons/tb';
import { Supplier, CreateSupplierDto } from '@/types/supplier.types';
import { useSupplierStore } from '@/stores/supplier.store';

interface SupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (supplier: Supplier) => void;
}

export function SupplierModal({
  supplier,
  isOpen,
  onClose,
  onSuccess,
}: SupplierModalProps) {
  const { addSupplier, editSupplier } = useSupplierStore();

  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState('RUC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name || '');
      setDocumentType(supplier.documentType || 'RUC');
      setDocumentNumber(supplier.documentNumber || '');
      setPhone(supplier.phone || '');
      setEmail(supplier.email || '');
      setContactName(supplier.contactName || '');
      setAddress(supplier.address || '');
      setNotes(supplier.notes || '');
    } else {
      setName('');
      setDocumentType('RUC');
      setDocumentNumber('');
      setPhone('');
      setEmail('');
      setContactName('');
      setAddress('');
      setNotes('');
    }
    setError(null);
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre o razón social es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      const dto: CreateSupplierDto = {
        name: name.trim(),
        documentType: documentType || undefined,
        documentNumber: documentNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        contactName: contactName.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive: supplier ? supplier.isActive : true,
      };

      let result: Supplier;
      if (supplier) {
        result = await editSupplier(supplier.id, dto);
      } else {
        result = await addSupplier(dto);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al guardar el proveedor';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
              <TbBuildingStore size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {supplier
                  ? 'Modifica los datos de contacto y facturación.'
                  : 'Registra un nuevo proveedor para tus compras.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <TbX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <TbAlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Razón Social */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Nombre / Razón Social <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Distribuidora Mayorista Tech S.A.C."
              className="w-full px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium shadow-2xs placeholder:text-gray-400"
            />
          </div>

          {/* Documento: Tipo y Número */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Tipo Doc.
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs cursor-pointer"
              >
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                N° Documento
              </label>
              <div className="relative">
                <TbId size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="20601234567"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Contacto: Persona y Teléfono */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Persona de Contacto
              </label>
              <div className="relative">
                <TbUser size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ej. Juan Pérez (Vendedor)"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <TbPhone size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Correo y Dirección */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <TbMail size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ventas@proveedor.com"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Dirección / Almacén
              </label>
              <div className="relative">
                <TbMapPin size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Central 123, Lima"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Observaciones / Notas (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Condiciones de crédito, días de entrega, cuenta bancaria, etc."
              className="w-full px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-y shadow-2xs placeholder:text-gray-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <TbLoader2 size={15} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <TbCheck size={16} />
                  <span>{supplier ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
