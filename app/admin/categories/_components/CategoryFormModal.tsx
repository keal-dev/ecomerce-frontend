'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TbX, 
  TbUpload, 
  TbTrash, 
  TbCheck
} from 'react-icons/tb';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/category.types';
import { uploadCategoryImage } from '@/services/category.service';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  initialData?: Category | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [href, setHref] = useState('');
  const [badge, setBadge] = useState('');
  
  // Manejo diferido de imagen:
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setHref(initialData.href || '');
      setExistingImageUrl(initialData.icon || '');
      setPreviewUrl(initialData.icon || '');
      setSelectedFile(null);
      setBadge(initialData.badge || '');
    } else {
      setName('');
      setHref('');
      setExistingImageUrl('');
      setPreviewUrl('');
      setSelectedFile(null);
      setBadge('');
    }
    setError(null);
    setSubmittingStep('');
  }, [initialData, isOpen]);

  // Limpieza de ObjectURL temporal al desmontar o cambiar
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Autogenera el slug automáticamente siempre a partir del nombre
  const handleNameChange = (val: string) => {
    setName(val);
    const slug = val.trim()
      ? '/category/' + val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : '';
    setHref(slug);
  };

  // Solo selecciona y previsualiza en memoria (NO sube a Cloudinary todavía)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB.');
      return;
    }

    // Revoca la anterior si era blob
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError(null);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setExistingImageUrl('');
    setPreviewUrl('');
  };

  // Función única al hacer clic en "Guardar":
  // 1. Si hay archivo nuevo seleccionado, lo sube primero a Cloudinary (ecomerce/categories)
  // 2. Con la URL obtenida, guarda la categoría en la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalImageUrl = existingImageUrl;

      // Paso 1: Subir imagen a Cloudinary solo si el usuario seleccionó un nuevo archivo
      if (selectedFile) {
        setSubmittingStep('Subiendo imagen');
        const uploadRes = await uploadCategoryImage(selectedFile);
        finalImageUrl = uploadRes.url;
      }

      // Paso 2: Guardar o actualizar la categoría en el backend
      setSubmittingStep('Guardando categoría');
      await onSubmit({
        name: name.trim(),
        href: href.trim() || undefined,
        icon: finalImageUrl.trim() || undefined,
        badge: badge.trim() || undefined,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la categoría.';
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
        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay envolvente que bloquea visualmente y físicamente todos los controles */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-10 h-10 border-3 border-[#3483fa] border-t-transparent rounded-full animate-spin mb-3 shadow-xs" />
            <p className="text-sm font-bold text-gray-900">
              {submittingStep || 'Procesando...'}
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Por favor espera, no cierres esta ventana mientras se completa la operación.
            </p>
          </div>
        )}

        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isEditing 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'bg-blue-50 text-[#3483fa] border border-blue-200'
              }`}>
                {isEditing ? 'Modo Edición' : 'Nueva'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing 
                ? 'Modifica los datos y la imagen de la categoría' 
                : 'Registra una categoría con su imagen representativa'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Cerrar modal"
          >
            <TbX size={19} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <fieldset disabled={isSubmitting} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nombre de la categoría <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej. Tecnología, Mascotas, Ropa..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] transition-all"
            />
          </div>

          {/* Selector de Imagen con vista previa instantánea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Imagen o Ícono representativo
              </label>
              {selectedFile && (
                <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                  <TbCheck size={13} /> Lista para subir al guardar
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 min-w-0 overflow-hidden">
                <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                  <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <span className="text-xs font-semibold text-gray-800 block truncate">
                      {selectedFile ? selectedFile.name : 'Imagen actual'}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                      {selectedFile ? (
                        <span>{(selectedFile.size / 1024).toFixed(1)} KB (local)</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <TbCheck size={12} /> Alojada en Cloudinary
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="p-1.5 text-xs text-gray-600 hover:text-[#3483fa] hover:bg-white rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="p-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                    title="Eliminar imagen"
                  >
                    <TbTrash size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#3483fa] hover:bg-gray-50/70 rounded-xl p-5 text-center cursor-pointer transition-all"
              >
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center">
                    <TbUpload size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#3483fa] hover:underline">
                      Selecciona una imagen
                    </span>
                    <span className="text-xs text-gray-500"> desde tu equipo</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Se subirá automáticamente a Cloudinary (<code className="text-gray-600 font-mono">ecomerce/categories</code>) al presionar Guardar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ruta / Slug (Siempre bloqueado) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Ruta (URL / Slug)
              </label>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                Bloqueado (automático)
              </span>
            </div>
            <input
              type="text"
              readOnly
              disabled
              value={href}
              placeholder="/category/tecnologia"
              className="w-full bg-gray-100/80 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 font-mono cursor-not-allowed select-none outline-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Se genera automáticamente a partir del nombre de la categoría.
            </p>
          </div>

          {/* Badge Promocional (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Insignia o Etiqueta (Opcional)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Ej. Envío Gratis, Oferta, Nuevo"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3483fa] transition-all"
            />
          </div>
          </fieldset>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 ${
                isEditing
                  ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                  : 'bg-[#3483fa] hover:bg-blue-600 active:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">
                    {submittingStep || 'Procesando...'}
                  </span>
                </>
              ) : (
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Categoría'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
