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
  FaHeart 
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
  const { addViewedId, viewedIds, clearHistory } = useRecentlyViewedStore();
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const symbol = company?.currencySymbol || 'S/';

  const handleAddToCart = () => {
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
    setAddedToCart(true);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    router.push('/cart');
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Cargar producto por slug o ID
        const currentProd = await getProductById(slugParam);
        if (!isMounted) return;

        setProduct(currentProd);
        setSelectedImageIndex(0);

        // Registrar en localStorage como visto recientemente
        if (currentProd?.id) {
          addViewedId(currentProd.id);
        }

        // Cargar otros productos para secciones relacionadas y recientes
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
      <div className="max-w-7xl mx-auto py-16 px-4 md:px-7">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-xl" />
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-10 bg-gray-100 rounded w-1/3 mt-4" />
            <div className="h-24 bg-gray-100 rounded w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-xs">
          <span className="text-5xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-500 mb-6">
            El producto que buscas no existe o ha sido retirado de nuestra tienda.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#3483fa] hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // Filtrar productos para "Basado en tu última visita" (excluyendo el actual)
  const recentlyViewedProducts = viewedIds
    .filter((id) => id !== product.id)
    .map((id) => allProducts.find((p) => p.id === id && p.isActive !== false))
    .filter((p): p is Product => !!p);

  // Productos relacionados de la misma categoría o marca
  const relatedProducts = allProducts.filter(
    (p) =>
      p.id !== product.id &&
      p.isActive !== false &&
      ((product.categoryId && p.categoryId === product.categoryId) ||
        (product.brandId && p.brandId === product.brandId))
  );

  // Galería de imágenes del producto
  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [];
  const activeImage = allImages[selectedImageIndex] || allImages[0] || product.imageUrl;

  return (
    <div className="pb-16 bg-[#f3f4f6] min-h-screen">
      <div className="max-w-7xl mx-auto pt-6 px-4 md:px-7">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                href={product.category.href || `/category/${product.category.id}`}
                className="hover:text-[#3483fa] transition-colors"
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
                className="hover:text-[#3483fa] transition-colors"
              >
                {product.brand.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800 font-medium truncate max-w-xs md:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* Main Product Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Product Image & Gallery */}
            <div className="md:col-span-6 lg:col-span-7 flex flex-col md:flex-row gap-4 items-start">
              {/* Miniaturas (Desktop: vertical a la izquierda, Mobile: horizontal debajo) */}
              {allImages.length > 1 && (
                <div className="flex md:flex-col gap-2.5 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[480px] w-full md:w-20 shrink-0 py-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setSelectedImageIndex(idx)}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-square w-16 md:w-20 rounded-xl border-2 p-1 bg-white cursor-pointer transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-[#3483fa] shadow-xs ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-400'
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
              <div className="flex-1 w-full order-1 md:order-2 flex flex-col items-center justify-center bg-white rounded-xl p-4 border border-gray-50 min-h-[380px] md:min-h-[480px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={product.title}
                  className="max-h-[440px] w-auto max-w-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right: Product Info & Purchase Box */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-2">
                    {product.brand && (
                      <Link
                        href={`/brand/${product.brand.slug || product.brand.id}`}
                        className="font-medium text-[#3483fa] hover:underline"
                      >
                        {product.brand.name}
                      </Link>
                    )}
                    {product.sku && <span>SKU: {product.sku}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => product && toggleFavorite(product.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all cursor-pointer ${
                        product && isFavorite(product.id)
                          ? 'bg-rose-50 text-rose-600 font-semibold border border-rose-200'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                      title={product && isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <FaHeart
                        size={13}
                        className={product && isFavorite(product.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}
                      />
                      <span>{product && isFavorite(product.id) ? 'Favorito' : 'Guardar'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      title="Compartir enlace"
                    >
                      <FaShareNodes size={13} />
                      <span>{copied ? 'Copiado!' : 'Compartir'}</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-xl lg:text-2xl font-normal text-gray-900 leading-snug mb-3">
                  {product.title}
                </h1>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  {product.freeShipping && (
                    <span className="text-[#00a650] text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <FaTruckFast size={12} /> Envío gratis
                    </span>
                  )}
                  {product.full && (
                    <span className="text-[#00a650] text-xs font-bold italic flex items-center bg-emerald-50/70 px-2 py-0.5 rounded">
                      <FaBolt size={10} className="mr-0.5" /> FULL
                    </span>
                  )}
                </div>

                {/* Pricing Block */}
                <div className="bg-gray-50/70 rounded-xl p-4 mb-6 border border-gray-100">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-gray-400 text-sm line-through block mb-0.5">
                      {symbol} {Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
                      {symbol} {Number(product.price).toFixed(2)}
                    </span>
                    {product.discount && product.discount > 0 ? (
                      <span className="text-[#00a650] text-sm font-bold bg-emerald-100/80 px-2 py-0.5 rounded">
                        {product.discount}% OFF
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Precio con todos los impuestos incluidos.
                  </p>
                </div>

                {/* Stock info */}
                <div className="mb-4">
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-[#00a650] font-medium">
                      <FaCheck size={14} />
                      <span>Stock disponible ({product.stock} unidades)</span>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500 font-medium">
                      Producto agotado temporalmente
                    </div>
                  )}
                </div>

                {/* Características destacadas */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6 bg-slate-50/90 rounded-xl p-4 border border-slate-100">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <FaCheck className="text-[#3483fa]" size={12} />
                      <span>Lo que tienes que saber de este producto</span>
                    </h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3483fa] mt-1.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quantity selector */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <label className="text-xs text-gray-600 font-medium">Cantidad:</label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="border border-gray-200 rounded-lg py-1.5 px-3 text-sm font-medium focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden bg-white"
                    >
                      {Array.from({ length: Math.min(product.stock, 6) }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'unidad' : 'unidades'}
                          </option>
                        )
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
                    className="w-full bg-[#3483fa] hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-xs disabled:cursor-not-allowed text-center cursor-pointer"
                  >
                    Comprar ahora
                  </button>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 text-[#3483fa] disabled:text-gray-400 font-medium py-3 px-6 rounded-xl transition-all border border-blue-200/50 disabled:border-transparent text-center cursor-pointer"
                    >
                      Agregar al carrito
                    </button>

                    <button
                      type="button"
                      onClick={() => product && toggleFavorite(product.id)}
                      title={product && isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      aria-label="Guardar en favoritos"
                      className={`h-12 w-12 flex items-center justify-center shrink-0 rounded-xl transition-all border cursor-pointer ${
                        product && isFavorite(product.id)
                          ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100 shadow-2xs'
                          : 'bg-white text-gray-400 border-gray-200 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50'
                      }`}
                    >
                      <FaHeart
                        size={18}
                        className={product && isFavorite(product.id) ? 'text-rose-500 fill-rose-500' : ''}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-2.5">
                  <FaArrowRotateLeft className="text-[#3483fa]" size={14} />
                  <span>
                    <strong className="text-gray-700">Devolución gratis.</strong> Tienes 30 días desde que lo recibes.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaShieldHalved className="text-[#3483fa]" size={14} />
                  <span>
                    <strong className="text-gray-700">Compra Protegida.</strong> Recibe el producto que esperabas o te devolvemos tu dinero.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Detailed Section */}
          {product.features && product.features.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Características principales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
                {product.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 text-xs font-medium text-gray-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3483fa] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          {product.description && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Descripción</h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line max-w-4xl">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="mt-6">
          <ProductCarousel
            title="Productos similares"
            products={relatedProducts.slice(0, 5)}
          />
        </div>
      )}

      {/* Basado en tu última visita (localStorage) */}
      {recentlyViewedProducts.length > 0 && (
        <div className="mt-2">
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

      {/* Modal de confirmación: Producto Agregado al Carrito */}
      {addedToCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheck size={20} />
            </div>

            <h3 className="text-base font-bold text-gray-900">
              ¡Agregado a tu carrito!
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {product.title}
            </p>
            <p className="text-xs font-semibold text-gray-800 mt-1">
              Cantidad: {quantity} {quantity === 1 ? 'unidad' : 'unidades'} • {symbol} {(Number(product.price) * quantity).toFixed(2)}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={() => setAddedToCart(false)}
                className="w-full py-2.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors text-center"
              >
                Ver mi carrito y pagar
              </Link>

              <button
                type="button"
                onClick={() => setAddedToCart(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
