'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaBolt,
  FaCheck,
  FaShieldHalved,
  FaTruckFast,
  FaArrowRotateLeft,
  FaShareNodes,
  FaHeart,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa6';
import { getProductById, getProducts } from '@/services/product.service';
import { Product } from '@/types/product.types';
import { useCompanyStore } from '@/stores/company.store';
import { useRecentlyViewedStore } from '@/stores/recently-viewed.store';
import { useCartStore } from '@/stores/cart.store';
import { useFavoritesStore } from '@/stores/favorites.store';
import { ProductCarousel } from '../../_components/ProductCarousel';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = (params?.slug as string) || '';

  const { company } = useCompanyStore();
  const { addViewedId, viewedIds } = useRecentlyViewedStore();
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const symbol = company?.currencySymbol || 'S/';

  const addProductToCart = () => {
    if (!product) return;
    addItem(
      {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        discount: product.discount ? Number(product.discount) : null,
        imageUrl: product.imageUrl,
        stock: product.stock,
        freeShipping: product.freeShipping,
        full: product.full,
      },
      quantity,
    );
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addProductToCart();
    openDrawer();
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;
    addProductToCart();
    router.push('/cart');
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const currentProd = await getProductById(slugParam);
        if (!isMounted) return;

        setProduct(currentProd);
        setSelectedImageIndex(0);
        setShowAllFeatures(false);

        if (currentProd?.id) {
          addViewedId(currentProd.id);
        }

        const prods = await getProducts();
        if (isMounted) {
          setAllProducts(prods || []);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Producto no encontrado';
        setError(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (slugParam) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [slugParam, addViewedId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 md:px-7 bg-white">
        <div className="bg-white rounded-none p-8 border border-[#d9d9d9] animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square bg-[#f8f8f8] rounded-none" />
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="h-5 bg-neutral-200 w-1/4" />
            <div className="h-8 bg-neutral-200 w-3/4" />
            <div className="h-12 bg-neutral-200 w-1/3 mt-4" />
            <div className="h-28 bg-neutral-100 w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center bg-white">
        <div className="bg-[#f8f8f8] rounded-none p-10 border border-[#d9d9d9]">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent block mb-2">
            No disponible
          </span>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-black mb-2">
            Producto no encontrado
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            El producto que buscas no existe o ha sido retirado de nuestro catálogo.
          </p>
          <Link
            href="/"
            className="inline-block bg-brand-accent hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-none transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const recentlyViewedProducts = viewedIds
    .filter((id) => id !== product.id)
    .map((id) => allProducts.find((p) => p.id === id && p.isActive !== false))
    .filter((p): p is Product => !!p);

  const relatedProducts = allProducts.filter(
    (p) =>
      p.id !== product.id &&
      p.isActive !== false &&
      ((product.categoryId && p.categoryId === product.categoryId) ||
        (product.brandId && p.brandId === product.brandId)),
  );

  const fallbackImage =
    'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&q=80';
  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [fallbackImage];
  const activeImage = allImages[selectedImageIndex] || allImages[0] || fallbackImage;

  return (
    <div className="pb-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto pt-6 px-4 md:px-7">
        {/* Breadcrumb */}
        <nav className="text-[11px] uppercase tracking-wider text-neutral-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-brand-accent transition-colors">
            Inicio
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                href={product.category.href || `/category/${product.category.id}`}
                className="hover:text-brand-accent transition-colors"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          {product.brand && (
            <>
              <Link
                href={`/brand/${product.brand.slug || product.brand.id}`}
                className="hover:text-brand-accent transition-colors"
              >
                {product.brand.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-black font-bold truncate max-w-xs md:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* Main Product Card */}
        <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Product Image & Gallery */}
            <div className="md:col-span-6 lg:col-span-7 flex flex-col md:flex-row gap-4 items-start">
              {/* Miniaturas */}
              {allImages.length > 1 && (
                <div className="flex md:flex-col gap-2.5 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[480px] w-full md:w-20 shrink-0 py-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setSelectedImageIndex(idx)}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-square w-16 md:w-20 rounded-none border-2 p-1 bg-[#f8f8f8] cursor-pointer transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-black'
                          : 'border-[#d9d9d9] hover:border-black'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${product.title} vista ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Imagen Principal Activa */}
              <div className="relative flex-1 w-full order-1 md:order-2 flex flex-col items-center justify-center bg-[#f8f8f8] rounded-none p-6 border border-[#d9d9d9] min-h-[380px] md:min-h-[480px]">
                {product.discount && product.discount > 0 ? (
                  <span className="absolute top-3 left-3 bg-brand-accent text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none">
                    -{product.discount}% OFF
                  </span>
                ) : null}
                {product.stock <= 0 && (
                  <span className="absolute top-3 right-3 bg-[#6f719b] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none">
                    Agotado
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={product.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackImage;
                  }}
                  className="max-h-[430px] w-auto max-w-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right: Product Info & Purchase Box */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-3 pb-3 border-b border-[#d9d9d9]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {product.brand && (
                      <Link
                        href={`/brand/${product.brand.slug || product.brand.id}`}
                        className="font-bold uppercase tracking-wider text-brand-accent hover:underline"
                      >
                        {product.brand.name}
                      </Link>
                    )}
                    {product.sku && (
                      <span className="font-mono text-[11px] text-neutral-500">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => product && toggleFavorite(product.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        product && isFavorite(product.id)
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-600 border-[#d9d9d9] hover:border-black hover:text-black'
                      }`}
                      title={product && isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <FaHeart
                        size={12}
                        className={product && isFavorite(product.id) ? 'text-brand-accent' : 'text-neutral-400'}
                      />
                      <span>{product && isFavorite(product.id) ? 'Favorito' : 'Guardar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-none border border-[#d9d9d9] text-neutral-600 hover:border-black hover:text-black text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      title="Compartir enlace"
                    >
                      <FaShareNodes size={12} />
                      <span>{copied ? 'Copiado' : 'Compartir'}</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="font-display text-2xl lg:text-3xl font-extrabold uppercase tracking-tight text-black leading-tight mb-3">
                  {product.title}
                </h1>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {product.freeShipping && (
                    <span className="text-[#2e9e7b] text-[11px] font-bold uppercase tracking-wider bg-[#2e9e7b]/10 border border-[#2e9e7b]/30 px-2.5 py-1 rounded-none flex items-center gap-1.5">
                      <FaTruckFast size={12} /> Envío gratis
                    </span>
                  )}
                  {product.full && (
                    <span className="text-[#2e9e7b] text-[11px] font-bold italic uppercase tracking-wider flex items-center bg-[#2e9e7b]/10 border border-[#2e9e7b]/30 px-2.5 py-1 rounded-none">
                      <FaBolt size={10} className="mr-1" /> EXPRESS
                    </span>
                  )}
                </div>

                {/* Pricing Block */}
                <div className="bg-[#f8f8f8] rounded-none p-5 mb-5 border border-[#d9d9d9]">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-neutral-400 text-sm line-through block mb-1">
                      {symbol} {Number(product.originalPrice).toFixed(2)} PEN
                    </span>
                  )}

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-display text-3xl lg:text-4xl font-extrabold text-black tracking-tight">
                      {symbol} {Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-[11px] font-bold uppercase text-black bg-white border border-[#d9d9d9] px-2 py-0.5 rounded-none">
                      PEN
                    </span>
                    {product.discount && product.discount > 0 ? (
                      <span className="bg-brand-accent text-white text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-none">
                        -{product.discount}% OFF
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-neutral-600 mt-2.5 flex items-center gap-1.5 font-medium">
                    <FaCheck className="text-[#2e9e7b] shrink-0" size={11} />
                    <span>
                      Precio final con <strong>18% IGV incluido</strong>. Boleta o Factura electrónica.
                    </span>
                  </p>
                </div>

                {/* Stock info */}
                <div className="mb-5">
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#2e9e7b] font-bold">
                      <FaCheck size={13} />
                      <span>Stock disponible ({product.stock} unidades disponibles)</span>
                    </div>
                  ) : (
                    <div className="inline-block bg-[#6f719b] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-none">
                      Producto agotado temporalmente
                    </div>
                  )}
                </div>

                {/* Características destacadas */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6 bg-[#f8f8f8] rounded-none p-4 border border-[#d9d9d9]">
                    <h3 className="text-[11px] font-bold text-black uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <FaCheck className="text-brand-accent" size={11} />
                      <span>Notas y características</span>
                    </h3>
                    <ul className="space-y-2">
                      {(showAllFeatures ? product.features : product.features.slice(0, 5)).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-brand-accent mt-1.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {product.features.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setShowAllFeatures((prev) => !prev)}
                        className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-accent hover:text-red-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1"
                      >
                        {showAllFeatures ? (
                          <>
                            <span>Ver menos</span>
                            <FaChevronUp size={10} />
                          </>
                        ) : (
                          <>
                            <span>Ver {product.features.length - 5} más</span>
                            <FaChevronDown size={10} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Quantity selector */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-4 mb-5">
                    <label className="text-xs text-black font-bold uppercase tracking-wider">
                      Cantidad:
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="border border-[#d9d9d9] rounded-none py-2 px-3 text-sm font-bold focus:border-black outline-none bg-white cursor-pointer"
                    >
                      {Array.from({ length: Math.min(product.stock, 12) }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'unidad' : 'unidades'}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="w-full bg-brand-accent hover:bg-red-700 disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-none transition-colors disabled:cursor-not-allowed text-center cursor-pointer"
                  >
                    Comprar ahora
                  </button>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      className="flex-1 bg-black hover:bg-neutral-800 disabled:bg-neutral-200 text-white disabled:text-neutral-400 text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded-none transition-colors disabled:cursor-not-allowed text-center cursor-pointer"
                    >
                      Agregar al carrito
                    </button>

                    <button
                      type="button"
                      onClick={() => product && toggleFavorite(product.id)}
                      title={product && isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      aria-label="Guardar en favoritos"
                      className={`h-11 w-11 flex items-center justify-center shrink-0 rounded-none transition-all border cursor-pointer ${
                        product && isFavorite(product.id)
                          ? 'bg-black text-brand-accent border-black'
                          : 'bg-white text-neutral-500 border-[#d9d9d9] hover:text-brand-accent hover:border-black'
                      }`}
                    >
                      <FaHeart
                        size={17}
                        className={product && isFavorite(product.id) ? 'text-brand-accent' : ''}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-8 pt-5 border-t border-[#d9d9d9] flex flex-col gap-3 text-xs text-neutral-600">
                <div className="flex items-center gap-2.5">
                  <FaArrowRotateLeft className="text-brand-accent shrink-0" size={14} />
                  <span>
                    <strong className="text-black">Cambio o devolución garantizada.</strong> Empaques y sellos de origen verificados.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaShieldHalved className="text-[#2e9e7b] shrink-0" size={14} />
                  <span>
                    <strong className="text-black">Calidad de origen garantizada.</strong> Productos artesanales de cooperativa y vinos (venta de alcohol +18).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha Técnica y Especificaciones */}
          <div className="mt-10 pt-8 border-t border-[#d9d9d9]">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-black mb-4 flex items-center gap-2">
              <FaShieldHalved className="text-brand-accent" size={16} />
              <span>Especificaciones y Garantía</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl text-xs">
              <div className="p-3.5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Estado del producto:</span>
                <span className="font-bold text-black">Empaque sellado de origen / 100% original</span>
              </div>
              <div className="p-3.5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Control de calidad:</span>
                <span className="font-bold text-[#2e9e7b]">Calidad y frescura garantizada de origen</span>
              </div>
              {product.brand && (
                <div className="p-3.5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Marca / Productor:</span>
                  <span className="font-bold text-brand-accent uppercase">{product.brand.name}</span>
                </div>
              )}
              {product.sku && (
                <div className="p-3.5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex justify-between items-center">
                  <span className="text-neutral-500 font-medium">Código / SKU:</span>
                  <span className="font-bold text-black font-mono">{product.sku}</span>
                </div>
              )}
              <div className="p-3.5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Disponibilidad:</span>
                <span className="font-bold text-[#2e9e7b]">
                  {product.stock > 0 ? 'En stock para despacho inmediato' : 'Sin stock'}
                </span>
              </div>
              <div className="p-3.5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Comprobante de Pago:</span>
                <span className="font-bold text-black">Boleta o Factura Electrónica SUNAT</span>
              </div>
            </div>
          </div>

          {/* Features Detailed Section */}
          {product.features && product.features.length > 0 && (
            <div className="mt-8 pt-8 border-t border-[#d9d9d9]">
              <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-black mb-4">
                Detalles destacados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
                {product.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] text-xs font-medium text-[#020202]"
                  >
                    <span className="w-2 h-2 bg-brand-accent shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="mt-8 pt-8 border-t border-[#d9d9d9]">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-black mb-3">
              Descripción del producto
            </h2>
            <div className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line max-w-4xl bg-[#f8f8f8] p-5 rounded-none border border-[#d9d9d9] space-y-3">
              <p>
                {product.description?.trim()
                  ? product.description
                  : `Disfruta de ${product.title}${product.brand?.name ? ` elaborado por ${product.brand.name}` : ''}. Un producto seleccionado de nuestra cooperativa con trazabilidad y calidad garantizada de origen.`}
              </p>

              <div className="pt-3 border-t border-[#d9d9d9] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#2e9e7b] shrink-0" size={12} />
                  <span>Producto 100% original con empaque y sello de origen.</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#2e9e7b] shrink-0" size={12} />
                  <span>Conservación controlada y despacho asegurado.</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#2e9e7b] shrink-0" size={12} />
                  <span>Emisión legal de Boleta o Factura electrónica con IGV.</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#2e9e7b] shrink-0" size={12} />
                  <span>Venta responsable de vinos exclusiva para mayores de 18 años.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <ProductCarousel
            title="Productos similares"
            products={relatedProducts.slice(0, 5)}
          />
        </div>
      )}

      {/* Basado en tu última visita (localStorage) */}
      {recentlyViewedProducts.length > 0 && (
        <div className="mt-4">
          <ProductCarousel
            title="Basado en tu última visita"
            products={recentlyViewedProducts}
            headerAction={{
              label: 'Ver historial',
              href: '/historial',
            }}
          />
        </div>
      )}
    </div>
  );
}
