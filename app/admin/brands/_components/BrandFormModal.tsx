'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TbX, 
  TbTrash, 
  TbCheck, 
  TbPhoto, 
  TbLoader2, 
  TbAlertCircle, 
  TbWorld 
} from 'react-icons/tb';
import { Brand, CreateBrandDto, UpdateBrandDto } from '@/types/brand.types';
import { uploadBrandImage } from '@/services/brand.service';

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBrandDto | UpdateBrandDto) => Promise<void>;
  initialData?: Brand | null;
}

export function BrandFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: BrandFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Manejo de imagen / logo
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setDescription(initialData.description || '');
      setWebsite(initialData.website || '');
      setIsActive(initialData.isActive ?? true);
      setExistingImageUrl(initialData.logoUrl || '');
      setPreviewUrl(initialData.logoUrl || '');
      setSelectedFile(null);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setWebsite('');
      setIsActive(true);
      setExistingImageUrl('');
      setPreviewUrl('');
      setSelectedFile(null);
    }
    setError(null);
    setSubmittingStep('');
  }, [initialData, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen del logo no debe superar los 5MB.');
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setExistingImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('El nombre de la marca es requerido.');
      return;
    }

    const trimmedSlug = slug.trim() ? slugify(slug) : slugify(trimmedName);

    try {
      setIsSubmitting(true);
      let finalLogoUrl = existingImageUrl;

      // Subir archivo a Cloudinary solo al guardar
      if (selectedFile) {
        setSubmittingStep('Subiendo logo de la marca a Cloudinary...');
        const uploadResult = await uploadBrandImage(selectedFile);
        finalLogoUrl = uploadResult.url;
      }

      setSubmittingStep(isEditing ? 'Actualizando datos...' : 'Guardando marca...');

      const payload: CreateBrandDto = {
        name: trimmedName,
        slug: trimmedSlug,
        logoUrl: finalLogoUrl || null,
        description: description.trim() || null,
        website: website.trim() || null,
        isActive,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la marca.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
      setSubmittingStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              {isEditing ? 'Editar Marca' : 'Nueva Marca'}
            </h2>
            <p className="text-[11px] text-gray-500">
              {isEditing
                ? 'Modifica los datos y el logotipo de la marca.'
                : 'Registra un fabricante o marca para tus productos.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <TbX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <TbAlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Subida de Logo */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Logo de la Marca
            </label>

            {previewUrl ? (
              <div className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-18 h-18 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center p-2 shrink-0 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {selectedFile ? selectedFile.name : 'Logo actual guardado'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB (listo para subir)`
                      : 'Alojado en la nube'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#3483fa] hover:underline cursor-pointer"
                    >
                      Cambiar foto
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <TbTrash size={13} />
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#3483fa] bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center mx-auto mb-2">
                  <TbPhoto size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  Haz clic o arrastra el logo aquí
                </p>
                <p className="text-[10.5px] text-gray-400 mt-0.5">
                  PNG, JPG, SVG o WebP hasta 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nombre de la Marca <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej. Samsung, Apple, Nike, Sony..."
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Identificador URL (Slug)
            </label>
            <div className="flex items-center">
              <span className="px-2.5 py-2 bg-gray-100 text-gray-500 border border-r-0 border-gray-200 rounded-l-lg text-xs font-mono select-none">
                /brand/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="samsung"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-r-lg text-xs font-mono text-gray-800 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Sitio Web (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Sitio Web Oficial (Opcional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <TbWorld size={15} />
              </span>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.marca.com"
                className="w-full pl-8.5 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Descripción (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Descripción o Slogan (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve reseña o información sobre la marca..."
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#3483fa] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <TbLoader2 size={15} className="animate-spin" />
                  <span>{submittingStep || 'Guardando...'}</span>
                </>
              ) : (
                <>
                  <TbCheck size={16} />
                  <span>{isEditing ? 'Guardar Cambios' : 'Crear Marca'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
