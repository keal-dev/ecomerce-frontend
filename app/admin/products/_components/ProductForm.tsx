'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TbChevronLeft,
  TbPhoto,
  TbTrash,
  TbCheck,
  TbLoader2,
  TbAlertCircle,
  TbTruck,
  TbBolt,
  TbFileText,
  TbCurrencyDollar,
  TbCategory,
  TbAdjustmentsHorizontal,
  TbListDetails,
  TbPlus,
  TbStar,
  TbStarFilled,
} from 'react-icons/tb';
import { Product, CreateProductDto, UpdateProductDto } from '@/types/product.types';
import { uploadProductImage, uploadProductImages } from '@/services/product.service';
import { useCategoryStore } from '@/stores/category.store';
import { useBrandStore } from '@/stores/brand.store';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>;
  isEditing?: boolean;
}

export function ProductForm({
  initialData,
  onSubmit,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const { categories, fetchCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [stock, setStock] = useState<string>('0');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [freeShipping, setFreeShipping] = useState(false);
  const [full, setFull] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Manejo de múltiples imágenes
  const [images, setImages] = useState<{ id: string; url: string; file?: File }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setSku(initialData.sku || '');
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
      setCostPrice(
        initialData.costPrice !== null && initialData.costPrice !== undefined
          ? String(initialData.costPrice)
          : '',
      );
      setOriginalPrice(
        initialData.originalPrice !== null && initialData.originalPrice !== undefined
          ? String(initialData.originalPrice)
          : '',
      );
      setDiscount(
        initialData.discount !== null && initialData.discount !== undefined
          ? String(initialData.discount)
          : '',
      );
      setStock(initialData.stock !== undefined ? String(initialData.stock) : '0');
      setDescription(initialData.description || '');
      const feats = Array.isArray(initialData.features) ? initialData.features : [];
      setFeaturesText(feats.join('\n'));
      setCategoryId(initialData.categoryId || '');
      setBrandId(initialData.brandId || '');
      setFreeShipping(initialData.freeShipping || false);
      setFull(initialData.full || false);
      setIsActive(initialData.isActive ?? true);

      // Cargar imágenes existentes
      const rawImages: string[] = [];
      if (Array.isArray(initialData.images) && initialData.images.length > 0) {
        rawImages.push(...initialData.images);
      } else if (initialData.imageUrl) {
        rawImages.push(initialData.imageUrl);
      }
      setImages(
        rawImages.map((url, i) => ({
          id: `existing-${i}-${Math.random()}`,
          url,
        })),
      );
    }
  }, [initialData]);

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Limpiar URLs blob en memoria SOLO al desmontar el formulario
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => {
        if (item.file && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
  };

  // Cálculo automático de descuento cuando cambian precios
  const calculatedDiscount = useMemo(() => {
    const p = parseFloat(price);
    const op = parseFloat(originalPrice);
    if (!isNaN(p) && !isNaN(op) && op > p && op > 0) {
      return Math.round(((op - p) / op) * 100);
    }
    return null;
  }, [price, originalPrice]);

  // Cálculo de margen de utilidad bruta (Precio Venta - Costo)
  const profitMargin = useMemo(() => {
    const p = parseFloat(price);
    const c = parseFloat(costPrice);
    if (!isNaN(p) && !isNaN(c) && p > 0 && c > 0) {
      const profit = p - c;
      const marginPct = (profit / p) * 100;
      return { profit, marginPct };
    }
    return null;
  }, [price, costPrice]);

  const handleFilesSelect = (fileList: FileList | File[]) => {
    const validItems: { id: string; url: string; file?: File }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona archivos de imagen válidos (PNG, JPG, SVG, WebP).');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada imagen no debe superar los 5MB.');
        continue;
      }
      validItems.push({
        id: `new-${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        file,
      });
    }

    if (validItems.length > 0) {
      setImages((prev) => [...prev, ...validItems]);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const item = prev[index];
      if (item?.file && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('El título del producto es obligatorio.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('El precio debe ser un número válido mayor o igual a 0.');
      return;
    }

    if (images.length === 0) {
      setError('Debes subir al menos una foto para el producto.');
      return;
    }

    const costPriceNum = costPrice ? parseFloat(costPrice) : undefined;
    const origPriceNum = originalPrice ? parseFloat(originalPrice) : undefined;
    const stockNum = stock ? parseInt(stock, 10) : 0;
    const finalDiscount = calculatedDiscount ?? (discount ? parseInt(discount, 10) : undefined);
    const finalSlug = slug.trim() ? slugify(slug) : slugify(trimmedTitle);
    const parsedFeatures = featuresText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    try {
      setIsSubmitting(true);
      const newFilesItems = images.filter((item) => item.file);
      const uploadedMap = new Map<string, string>();

      if (newFilesItems.length > 0) {
        setSubmittingStep(`Subiendo ${newFilesItems.length} foto(s) a Cloudinary...`);
        const filesToUpload = newFilesItems.map((item) => item.file!);
        const uploadResults = await uploadProductImages(filesToUpload);
        uploadResults.forEach((res, idx) => {
          uploadedMap.set(newFilesItems[idx].id, res.url);
        });
      }

      setSubmittingStep(isEditing ? 'Actualizando producto...' : 'Guardando producto...');

      // Construir array final de URLs en el orden exacto
      const finalImageUrls = images.map((item) => {
        if (item.file) {
          return uploadedMap.get(item.id) || item.url;
        }
        return item.url;
      });

      const payload: CreateProductDto = {
        title: trimmedTitle,
        slug: finalSlug,
        sku: sku.trim() || undefined,
        price: priceNum,
        costPrice: costPriceNum,
        originalPrice: origPriceNum,
        discount: finalDiscount,
        stock: isNaN(stockNum) ? 0 : stockNum,
        imageUrl: finalImageUrls[0],
        images: finalImageUrls,
        description: description.trim() || undefined,
        features: parsedFeatures,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        freeShipping,
        full,
        isActive,
      };

      await onSubmit(payload);
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el producto.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
      setSubmittingStep('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Barra Superior con Navegación y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-1.5"
          >
            <TbChevronLeft size={16} />
            <span>Volver al listado de productos</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {isEditing ? `Editar: ${initialData?.title || 'Producto'}` : 'Nuevo Producto'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditing
              ? 'Actualiza los datos, precios, inventario e imagen del producto.'
              : 'Completa la ficha técnica para publicar tu producto en el catálogo.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <TbLoader2 size={16} className="animate-spin" />
                <span>{submittingStep || 'Guardando...'}</span>
              </>
            ) : (
              <>
                <TbCheck size={16} />
                <span>{isEditing ? 'Guardar Cambios' : 'Publicar Producto'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
          <TbAlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de 2 Columnas (Principal + Lateral) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna Principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bloque: Información General */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <TbFileText size={18} className="text-blue-500" />
              <span>Información Básica</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Título del Producto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ej. Laptop Gamer Lenovo Legion 5 Pro 16'' RTX 4060..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium shadow-xs placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Identificador URL (Slug)
                </label>
                <div className="flex items-center shadow-xs rounded-lg">
                  <span className="px-3 py-2.5 bg-gray-100 text-gray-600 font-semibold border border-r-0 border-gray-300 rounded-l-lg text-xs font-mono select-none">
                    /product/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="laptop-gamer-lenovo"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-r-lg text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Código de Barras / SKU (Opcional)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU-892104"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono font-medium shadow-xs placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Descripción del Producto
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Especificaciones técnicas detalladas, características destacadas, garantía..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-y shadow-xs leading-relaxed placeholder:text-gray-400"
              />
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <TbListDetails size={16} className="text-[#3483fa]" />
                  <span>Características del Producto (una por fila/línea)</span>
                </label>
                {featuresText.split('\n').filter((l) => l.trim().length > 0).length > 0 && (
                  <span className="text-[11px] font-bold text-[#3483fa] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                    {featuresText.split('\n').filter((l) => l.trim().length > 0).length} característica(s)
                  </span>
                )}
              </div>
              <textarea
                rows={6}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder={'Pantalla AMOLED de 6.67" 120Hz\nProcesador Snapdragon 8 Gen 2\nBatería de 5000 mAh con carga rápida\nCámara principal de 108 MP con OIS\n12 GB de RAM + 256 GB de almacenamiento'}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-y leading-relaxed shadow-xs placeholder:text-gray-400"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Ingresa cada característica en una línea distinta presionando <strong>Enter</strong>.
              </p>

              {featuresText.split('\n').filter((l) => l.trim().length > 0).length > 0 && (
                <div className="mt-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-2">
                    Vista previa de características ({featuresText.split('\n').filter((l) => l.trim().length > 0).length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {featuresText
                      .split('\n')
                      .map((l) => l.trim())
                      .filter((l) => l.length > 0)
                      .map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-gray-300 text-xs text-gray-800 shadow-2xs font-medium"
                        >
                          <TbCheck size={13} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>{feat}</span>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bloque: Precios e Inventario */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <TbCurrencyDollar size={18} className="text-emerald-500" />
              <span>Precios e Inventario</span>
            </h2>

            {/* Fila 1: 3 Columnas Amplias para Precios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Precio de Venta (S/) <span className="text-rose-500">*</span>
                </label>
                <div className="relative shadow-xs rounded-lg">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 select-none">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span>Precio de Costo (S/)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Opcional</span>
                </label>
                <div className="relative shadow-xs rounded-lg">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 select-none">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span>Precio Original (S/)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Tachado</span>
                </label>
                <div className="relative shadow-xs rounded-lg">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500 select-none">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Inventario / Stock y Badges informativos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Stock Disponible (Unidades)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-xs placeholder:text-gray-400"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-2">
                {profitMargin && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between shadow-2xs">
                    <span>Margen de Ganancia estimado:</span>
                    <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs">
                      +{profitMargin.marginPct.toFixed(1)}% (+S/ {profitMargin.profit.toFixed(2)} utilidad)
                    </span>
                  </div>
                )}

                {calculatedDiscount !== null && calculatedDiscount > 0 && (
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold flex items-center justify-between shadow-2xs">
                    <span>Descuento promocional:</span>
                    <span className="bg-[#3483fa] text-white px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs">
                      {calculatedDiscount}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Lateral (1/3) */}
        <div className="space-y-6">
          {/* Galería de Fotos del Producto */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TbPhoto size={18} className="text-purple-500" />
                <span>Fotos del Producto</span>
                <span className="text-rose-500">*</span>
              </h2>
              {images.length > 0 && (
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {images.length} foto{images.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {images.length > 0 ? (
              <div className="space-y-4">
                {/* Foto Principal (Portada) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <TbStarFilled size={14} className="text-amber-500" />
                      <span>Foto de Portada</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(0)}
                      className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer flex items-center gap-1"
                      title="Eliminar portada"
                    >
                      <TbTrash size={13} />
                      <span>Quitar</span>
                    </button>
                  </div>
                  <div className="w-full h-52 bg-gray-50 rounded-xl border-2 border-amber-300 overflow-hidden flex items-center justify-center p-3 relative group shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={images[0].id}
                      src={images[0].url}
                      alt="Foto de portada"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <TbStarFilled size={11} /> Portada
                    </div>
                  </div>
                </div>

                {/* Grid de Fotos Secundarias / Galería */}
                {images.length > 1 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700 block">
                      Fotos adicionales ({images.length - 1}):
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {images.slice(1).map((item, idx) => {
                        const realIndex = idx + 1;
                        return (
                          <div
                            key={item.id}
                            className="group relative aspect-square bg-gray-50 rounded-lg border border-gray-300 overflow-hidden shadow-2xs hover:border-[#3483fa] transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.url}
                              alt={`Foto ${realIndex + 1}`}
                              className="w-full h-full object-contain p-1.5"
                            />
                            {/* Hover overlay with actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <button
                                type="button"
                                onClick={() => handleSetCover(realIndex)}
                                className="w-full py-1 px-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold flex items-center justify-center gap-0.5 cursor-pointer shadow-xs"
                                title="Hacer foto de portada"
                              >
                                <TbStar size={11} />
                                <span>Portada</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(realIndex)}
                                className="w-full py-1 px-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center justify-center gap-0.5 cursor-pointer shadow-xs"
                                title="Quitar foto"
                              >
                                <TbTrash size={11} />
                                <span>Quitar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Botón para añadir más fotos */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 border-2 border-dashed border-gray-300 hover:border-[#3483fa] hover:bg-blue-50/30 rounded-xl text-xs font-bold text-[#3483fa] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <TbPlus size={16} />
                  <span>Subir más fotos</span>
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#3483fa] bg-blue-50/60 ring-4 ring-blue-500/10'
                    : 'border-gray-300 hover:border-[#3483fa] bg-gray-50/60 hover:bg-blue-50/30'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#3483fa] border border-blue-100 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                  <TbPhoto size={24} />
                </div>
                <p className="text-xs font-bold text-gray-900">
                  Haz clic o arrastra fotos del producto
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Puedes seleccionar múltiples fotos a la vez (PNG, JPG, WebP)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Clasificación: Categoría y Marca */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
              <TbCategory size={18} className="text-amber-500" />
              <span>Clasificación</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-semibold cursor-pointer shadow-xs"
              >
                <option value="">Selecciona una categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Marca / Fabricante
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 hover:border-gray-400 focus:border-[#3483fa] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-semibold cursor-pointer shadow-xs"
              >
                <option value="">Selecciona una marca...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opciones de Envío y Estado */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
              <TbAdjustmentsHorizontal size={18} className="text-teal-500" />
              <span>Configuraciones Adicionales</span>
            </h2>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 bg-gray-50/50 hover:bg-blue-50/20 transition-all cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={freeShipping}
                onChange={(e) => setFreeShipping(e.target.checked)}
                className="w-4 h-4 text-[#3483fa] rounded border-gray-300 focus:ring-[#3483fa] accent-[#3483fa] cursor-pointer"
              />
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <TbTruck size={17} className="text-[#00a650]" />
                <span>Envío Gratis</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 bg-gray-50/50 hover:bg-blue-50/20 transition-all cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={full}
                onChange={(e) => setFull(e.target.checked)}
                className="w-4 h-4 text-[#3483fa] rounded border-gray-300 focus:ring-[#3483fa] accent-[#3483fa] cursor-pointer"
              />
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <TbBolt size={17} className="text-[#00a650]" />
                <span>Envío Full (Despacho Express)</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
