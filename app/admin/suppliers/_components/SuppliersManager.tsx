'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TbSearch,
  TbPlus,
  TbRefresh,
  TbBuildingStore,
  TbPencil,
  TbTrash,
  TbPhone,
  TbMail,
  TbCheck,
  TbX,
  TbBrandWhatsapp,
  TbNotes,
  TbUser,
} from 'react-icons/tb';
import { useSupplierStore } from '@/stores/supplier.store';
import { Supplier } from '@/types/supplier.types';
import { SupplierModal } from './SupplierModal';

export function SuppliersManager() {
  const {
    suppliers,
    isLoading,
    fetchSuppliers,
    removeSupplier,
    editSupplier,
  } = useSupplierStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      setUpdatingStatusId(supplier.id);
      await editSupplier(supplier.id, { isActive: !supplier.isActive });
    } catch {
      alert('Error al actualizar el estado del proveedor.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filtrado reactivo en vivo
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase().trim();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.documentNumber && s.documentNumber.toLowerCase().includes(q)) ||
        (s.contactName && s.contactName.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)),
    );
  }, [suppliers, searchQuery]);

  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setSelectedSupplier(s);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar al proveedor "${name}"?`)) {
      try {
        setDeletingId(id);
        await removeSupplier(id);
      } catch (err) {
        alert('Error al eliminar el proveedor.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TbBuildingStore className="text-[#3483fa]" size={26} />
              <span>Directorio de Proveedores</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3483fa] border border-blue-200 shadow-2xs">
              {suppliers.length} {suppliers.length === 1 ? 'proveedor' : 'proveedores'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Administra tus proveedores, contactos y datos de facturación para tus compras.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchSuppliers()}
            disabled={isLoading}
            className="p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Actualizar listado"
          >
            <TbRefresh size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <TbPlus size={18} />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Buscador Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <TbSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por razón social, RUC, contacto o teléfono..."
            className="w-full bg-white border border-gray-300 hover:border-gray-400 rounded-lg py-2 pl-9 pr-8 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <TbX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Proveedores */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredSuppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Razón Social / Proveedor</th>
                  <th className="px-3 py-2.5">Documento</th>
                  <th className="px-3 py-2.5">Contacto / Asesor</th>
                  <th className="px-3 py-2.5">Teléfono / WhatsApp</th>
                  <th className="px-3 py-2.5">Correo</th>
                  <th className="px-3 py-2.5 text-center w-24">Estado</th>
                  <th className="px-3 py-2.5 text-center w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((supplier) => {
                  const cleanPhone = supplier.phone?.replace(/\D/g, '');

                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      {/* Razón Social */}
                      <td className="px-3.5 py-3">
                        <p className="font-bold text-gray-900">
                          {supplier.name}
                        </p>
                        {supplier.address && (
                          <p className="text-[11px] text-gray-400 truncate max-w-xs">
                            {supplier.address}
                          </p>
                        )}
                      </td>

                      {/* Documento */}
                      <td className="px-3 py-3">
                        {supplier.documentNumber ? (
                          <div>
                            <span className="font-mono text-xs font-semibold text-gray-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                              {supplier.documentNumber}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-1">
                              ({supplier.documentType || 'RUC'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">
                            Sin documento
                          </span>
                        )}
                      </td>

                      {/* Contacto */}
                      <td className="px-3 py-3">
                        {supplier.contactName ? (
                          <span className="font-medium text-gray-800 flex items-center gap-1.5">
                            <TbUser size={14} className="text-gray-400" />
                            <span>{supplier.contactName}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Teléfono */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {supplier.phone ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-medium text-gray-700">
                              {supplier.phone}
                            </span>
                            {cleanPhone && cleanPhone.length >= 9 && (
                              <a
                                href={`https://wa.me/51${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Abrir WhatsApp"
                              >
                                <TbBrandWhatsapp size={16} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Correo */}
                      <td className="px-3 py-3">
                        {supplier.email ? (
                          <a
                            href={`mailto:${supplier.email}`}
                            className="text-blue-600 hover:underline text-xs truncate block max-w-[180px]"
                          >
                            {supplier.email}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Estado Interactivo en la Tabla */}
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(supplier)}
                          disabled={updatingStatusId === supplier.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border shadow-2xs select-none disabled:opacity-50 ${
                            supplier.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-700'
                          }`}
                          title={
                            supplier.isActive
                              ? 'Haz clic para desactivar proveedor'
                              : 'Haz clic para activar proveedor'
                          }
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              supplier.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{supplier.isActive ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(supplier)}
                            className="p-1.5 text-gray-500 hover:text-[#3483fa] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Editar proveedor"
                          >
                            <TbPencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(supplier.id, supplier.name)}
                            disabled={deletingId === supplier.id}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Eliminar proveedor"
                          >
                            <TbTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3483fa] border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
              <TbBuildingStore size={30} />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              {searchQuery ? 'No se encontraron proveedores' : 'Aún no tienes proveedores registrados'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Prueba con otro término de búsqueda o RUC.'
                : 'Registra tus proveedores frecuentes para agilizar el ingreso de compras y stock.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <TbPlus size={16} />
                <span>Registrar Primer Proveedor</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      <SupplierModal
        supplier={selectedSupplier}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
