'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  TbRefresh,
  TbPencil,
  TbTrash,
  TbPhoto,
  TbLink,
  TbChevronLeft,
  TbExternalLink,
  TbPlus,
  TbGripVertical,
  TbPin,
  TbLoader2,
} from 'react-icons/tb';
import { useBannerStore } from '@/stores/banner.store';
import { Banner, UpdateBannerDto } from '@/types/banner.types';
import { uploadBannerImage } from '@/services/banner.service';
import { BannerFormModal } from './BannerFormModal';

export function BannersManager() {
  const {
    slots,
    isLoading,
    fetchSlots,
    updateSlot,
    toggleSlot,
    clearSlot,
    reorderSlots,
  } = useBannerStore();

  const [selectedSlot, setSelectedSlot] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados para subida directa de imágenes desde la lista
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetUploadOrder, setTargetUploadOrder] = useState<number | null>(null);
  const [uploadingSlotOrder, setUploadingSlotOrder] = useState<number | null>(null);

  // Estados para Drag & Drop nativo entre los secundarios
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSlots(true);
  }, [fetchSlots]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // El primer slot siempre es el Principal (Fijo)
  const principalSlot = useMemo(() => {
    return slots.find((s) => s.order === 1) || slots[0] || null;
  }, [slots]);

  // Los demás slots son los secundarios (Arrastrables, sin enumerar)
  const secondarySlots = useMemo(() => {
    return slots.filter((s) => s.order > 1);
  }, [slots]);

  // Conteo de banners activos
  const activeCount = useMemo(() => {
    return slots.filter((s) => s.isActive && s.imageUrl).length;
  }, [slots]);

  // Abrir modal solo para Nombre y Enlace
  const handleOpenConfigure = (slot: Banner) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (order: number, data: UpdateBannerDto) => {
    await updateSlot(order, data);
    showToast(order === 1 ? 'Banner Principal actualizado.' : 'Banner actualizado con éxito.');
  };

  // Disparar selector de archivos directo para un slot
  const handleTriggerUpload = (order: number) => {
    setTargetUploadOrder(order);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Procesar archivo seleccionado directamente en la lista
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const orderToUpload = targetUploadOrder;

    if (!file || orderToUpload === null) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('La imagen no debe superar los 8MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploadingSlotOrder(orderToUpload);
      const uploadResult = await uploadBannerImage(file);
      await updateSlot(orderToUpload, {
        imageUrl: uploadResult.url,
        isActive: true,
      });
      showToast('Imagen actualizada y banner activado con éxito.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir la imagen.';
      showToast(msg);
    } finally {
      setUploadingSlotOrder(null);
      setTargetUploadOrder(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleSlot = async (slot: Banner) => {
    if (!slot.imageUrl) {
      showToast('Primero sube una imagen al banner para poder activarlo.');
      return;
    }
    try {
      const updated = await toggleSlot(slot.order);
      showToast(
        updated.isActive
          ? 'Banner activado en la tienda.'
          : 'Banner pausado.',
      );
    } catch {
      showToast('Error al cambiar estado.');
    }
  };

  const handleClearSlot = async (slot: Banner) => {
    if (!confirm('¿Deseas quitar la imagen y el enlace de este banner?')) {
      return;
    }
    try {
      await clearSlot(slot.order);
      showToast('Banner vaciado.');
    } catch {
      showToast('Error al vaciar.');
    }
  };

  // Manejo de Drag and Drop (Exclusivo para los secundarios, el principal nunca se mueve)
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedSecondary = [...secondarySlots];
    const [movedItem] = reorderedSecondary.splice(draggedIndex, 1);
    reorderedSecondary.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);

    // Reconstruye la lista completa manteniendo siempre el principal de primero
    const fullList = principalSlot ? [principalSlot, ...reorderedSecondary] : reorderedSecondary;
    await reorderSlots(fullList);
    showToast('Posición de banners actualizada.');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Input de archivo invisible para subida directa */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#00a650]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-1.5"
          >
            <TbChevronLeft size={16} />
            <span>Volver a Configuración</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Banners del Carrusel
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              {activeCount} {activeCount === 1 ? 'activo' : 'activos'} en tienda
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Sube o cambia la imagen directo en la lista. Arrastra los banners secundarios para ordenar la rotación.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => fetchSlots(true)}
            title="Refrescar lista"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <TbRefresh size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {isLoading && slots.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-xs">
          Cargando banners...
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECCIÓN 1: BANNER PRINCIPAL (FIJO / NO ARRASTRABLE) */}
          {principalSlot && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <TbPin size={15} className="text-amber-600" />
                <span>Banner Principal (Fijo)</span>
              </div>

              {(() => {
                const hasImage = Boolean(principalSlot.imageUrl);
                const isLive = principalSlot.isActive && hasImage;
                const isUploading = uploadingSlotOrder === principalSlot.order;

                return (
                  <div
                    className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 sm:gap-4 shadow-xs ${
                      isLive
                        ? 'bg-amber-50/20 border-amber-300 ring-1 ring-amber-200/60'
                        : hasImage
                        ? 'bg-white border-amber-200 hover:border-amber-300'
                        : 'bg-amber-50/10 border-dashed border-amber-300 hover:bg-white'
                    }`}
                  >
                    {/* Lado Izquierdo: Insignia Fija + Miniatura + Datos */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <TbPin size={12} />
                        <span>Principal</span>
                      </span>

                      {/* Miniatura Panorámica - Clic para subir o cambiar foto directo */}
                      {hasImage ? (
                        <div
                          onClick={() => !isUploading && handleTriggerUpload(principalSlot.order)}
                          className="w-28 sm:w-36 h-12 sm:h-14 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shrink-0 cursor-pointer relative group"
                          title="Clic para cambiar imagen directamente"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={principalSlot.imageUrl!}
                            alt={principalSlot.title}
                            className="w-full h-full object-cover"
                          />

                          {isUploading ? (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                              <TbLoader2 size={18} className="animate-spin text-amber-300" />
                              <span className="text-[9px] font-bold mt-0.5">Subiendo...</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white">
                              <TbPhoto size={15} />
                              <span className="text-[10px] font-bold">Cambiar</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => !isUploading && handleTriggerUpload(principalSlot.order)}
                          className="w-28 sm:w-36 h-12 sm:h-14 rounded-lg border-2 border-dashed border-amber-300 hover:border-amber-500 flex items-center justify-center shrink-0 text-amber-700 bg-amber-50/40 hover:bg-amber-50 transition-all cursor-pointer relative"
                          title="Clic para subir imagen directamente"
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center">
                              <TbLoader2 size={16} className="animate-spin text-amber-600" />
                              <span className="text-[9px] font-bold text-amber-700">Subiendo...</span>
                            </div>
                          ) : (
                            <>
                              <TbPlus size={16} />
                              <span className="text-[11px] font-bold ml-1 hidden sm:inline">Subir Foto</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Título y Enlace */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {hasImage
                            ? principalSlot.title || 'Portada Principal'
                            : 'Banner Principal (Sin imagen asignada)'}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                          {hasImage ? (
                            principalSlot.linkUrl ? (
                              <>
                                <TbLink size={12} className="text-gray-400 shrink-0" />
                                <span className="truncate text-gray-700 font-medium">
                                  {principalSlot.linkUrl}
                                </span>
                                <Link
                                  href={principalSlot.linkUrl}
                                  target="_blank"
                                  title="Probar enlace"
                                  className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                                >
                                  <TbExternalLink size={12} />
                                </Link>
                              </>
                            ) : (
                              <span className="text-gray-400 italic">Sin enlace asignado</span>
                            )
                          ) : (
                            <span className="text-gray-400 italic">
                              Primer slide que verán tus clientes al entrar a la tienda
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lado Derecho: Switch Activo + Acciones */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Estado / Switch */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full hidden sm:inline-block ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : hasImage
                              ? 'bg-gray-100 text-gray-600 border border-gray-200'
                              : 'bg-gray-50 text-gray-400 border border-gray-200'
                          }`}
                        >
                          {isLive ? 'Activo' : hasImage ? 'Pausado' : 'Vacío'}
                        </span>

                        <label
                          className={`relative inline-flex items-center ${
                            hasImage ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                          }`}
                          title={hasImage ? 'Activar/Pausar este banner' : 'Sube una foto primero'}
                        >
                          <input
                            type="checkbox"
                            checked={principalSlot.isActive && hasImage}
                            disabled={!hasImage}
                            onChange={() => handleToggleSlot(principalSlot)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#00a650]"></div>
                        </label>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1">
                        {/* Botón directo de subir/cambiar foto */}
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload(principalSlot.order)}
                          disabled={isUploading}
                          title={hasImage ? 'Cambiar imagen' : 'Subir imagen'}
                          className="p-1.5 text-gray-600 hover:text-amber-700 hover:bg-amber-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <TbPhoto size={15} />
                        </button>

                        {/* Botón de configurar nombre y enlace */}
                        <button
                          type="button"
                          onClick={() => handleOpenConfigure(principalSlot)}
                          title="Configurar nombre y enlace"
                          className="p-1.5 text-gray-600 hover:text-[#3483fa] hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <TbPencil size={15} />
                        </button>

                        {hasImage && (
                          <button
                            type="button"
                            onClick={() => handleClearSlot(principalSlot)}
                            title="Vaciar banner principal"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <TbTrash size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SECCIÓN 2: BANNERS ROTATIVOS (ARRASTRABLES CON DRAG & DROP / SIN ENUMERAR) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Banners Secundarios / Rotativos
              </span>
              <span className="text-[11px] text-gray-400">
                Arrastra para ordenar. Sube fotos directamente haciendo clic en las miniaturas.
              </span>
            </div>

            <div className="space-y-2">
              {secondarySlots.map((slot, index) => {
                const hasImage = Boolean(slot.imageUrl);
                const isLive = slot.isActive && hasImage;
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;
                const isUploading = uploadingSlotOrder === slot.order;

                return (
                  <div
                    key={slot.id || index}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 sm:gap-4 shadow-2xs ${
                      isDragging
                        ? 'opacity-40 border-[#3483fa] bg-blue-50/30'
                        : isDragOver
                        ? 'border-[#3483fa] bg-blue-50/50 scale-[1.01]'
                        : isLive
                        ? 'bg-white border-emerald-300 ring-1 ring-emerald-100'
                        : hasImage
                        ? 'bg-white border-gray-200 hover:border-gray-300'
                        : 'bg-gray-50/50 border-dashed border-gray-300 hover:bg-white hover:border-[#3483fa]'
                    }`}
                  >
                    {/* Lado Izquierdo: Agarre de arrastre + Miniatura + Datos (SIN NÚMEROS) */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Agarre de Arrastre */}
                      <div
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnd={handleDragEnd}
                        title="Arrastra para reordenar"
                        className="p-1 text-gray-400 hover:text-gray-800 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded transition-colors shrink-0"
                      >
                        <TbGripVertical size={18} />
                      </div>

                      {/* Miniatura Panorámica Compacta - Clic directo para subir/cambiar foto */}
                      {hasImage ? (
                        <div
                          onClick={() => !isUploading && handleTriggerUpload(slot.order)}
                          className="w-24 sm:w-32 h-11 sm:h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shrink-0 cursor-pointer relative group"
                          title="Clic para cambiar imagen directamente"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slot.imageUrl!}
                            alt={slot.title}
                            className="w-full h-full object-cover"
                          />

                          {isUploading ? (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                              <TbLoader2 size={16} className="animate-spin text-blue-400" />
                              <span className="text-[9px] font-bold mt-0.5">Subiendo...</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white">
                              <TbPhoto size={14} />
                              <span className="text-[10px] font-bold">Cambiar</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => !isUploading && handleTriggerUpload(slot.order)}
                          className="w-24 sm:w-32 h-11 sm:h-12 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#3483fa] flex items-center justify-center shrink-0 text-gray-400 hover:text-[#3483fa] bg-gray-50/60 hover:bg-blue-50/30 transition-all cursor-pointer relative"
                          title="Clic para subir imagen directamente"
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center">
                              <TbLoader2 size={15} className="animate-spin text-[#3483fa]" />
                              <span className="text-[9px] font-bold text-gray-600">Subiendo...</span>
                            </div>
                          ) : (
                            <>
                              <TbPlus size={15} />
                              <span className="text-[10px] font-bold ml-1 hidden sm:inline">Subir Foto</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Título y Enlace (Sin números) */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {hasImage ? slot.title || 'Banner Promocional' : 'Banner Disponible'}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                          {hasImage ? (
                            slot.linkUrl ? (
                              <>
                                <TbLink size={12} className="text-gray-400 shrink-0" />
                                <span className="truncate text-gray-700 font-medium">
                                  {slot.linkUrl}
                                </span>
                                <Link
                                  href={slot.linkUrl}
                                  target="_blank"
                                  title="Probar enlace"
                                  className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                                >
                                  <TbExternalLink size={12} />
                                </Link>
                              </>
                            ) : (
                              <span className="text-gray-400 italic">Sin enlace asignado</span>
                            )
                          ) : (
                            <span className="text-gray-400 italic">
                              Haz clic en la miniatura para subir una foto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lado Derecho: Switch Activo + Acciones */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Estado / Switch */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full hidden sm:inline-block ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : hasImage
                              ? 'bg-gray-100 text-gray-600 border border-gray-200'
                              : 'bg-gray-50 text-gray-400 border border-gray-200'
                          }`}
                        >
                          {isLive ? 'Activo' : hasImage ? 'Pausado' : 'Vacío'}
                        </span>

                        <label
                          className={`relative inline-flex items-center ${
                            hasImage ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                          }`}
                          title={hasImage ? 'Activar/Pausar este banner' : 'Sube una foto primero'}
                        >
                          <input
                            type="checkbox"
                            checked={slot.isActive && hasImage}
                            disabled={!hasImage}
                            onChange={() => handleToggleSlot(slot)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#00a650]"></div>
                        </label>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1">
                        {/* Botón directo de subir/cambiar foto */}
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload(slot.order)}
                          disabled={isUploading}
                          title={hasImage ? 'Cambiar imagen' : 'Subir imagen'}
                          className="p-1.5 text-gray-600 hover:text-[#3483fa] hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <TbPhoto size={14} />
                        </button>

                        {/* Botón de configurar nombre y enlace */}
                        <button
                          type="button"
                          onClick={() => handleOpenConfigure(slot)}
                          title="Configurar nombre y enlace"
                          className="p-1.5 text-gray-600 hover:text-[#3483fa] hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <TbPencil size={14} />
                        </button>

                        {hasImage && (
                          <button
                            type="button"
                            onClick={() => handleClearSlot(slot)}
                            title="Vaciar banner"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <TbTrash size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración (Solo Nombre y Enlace de Destino) */}
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slot={selectedSlot}
        onSubmit={handleSaveSlot}
      />
    </div>
  );
}
