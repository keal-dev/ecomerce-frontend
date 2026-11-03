'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  TbChevronRight, 
  TbAward, 
  TbArrowLeft,
  TbExternalLink,
  TbBuildingStore,
} from 'react-icons/tb';
import { useBrandStore } from '@/stores/brand.store';
import { ProductCard } from '@/app/(ecomerce)/_components/ProductCard';
import { getProducts } from '@/services/product.service';
import { Product } from '@/types/product.types';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default function BrandDetailPage({ params }: BrandPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { brands, fetchBrands, isLoading: brandsLoading } = useBrandStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Encontrar la marca por slug o id
  const currentBrand = brands.find((b) => {
    const slugFromName = b.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (
      b.id === slug ||
      b.slug === slug ||
      slugFromName === slug
    );
  });

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setIsProductsLoading(true);
      try {
        if (currentBrand) {
          const res = await getProducts({ brandId: currentBrand.id, isActive: true });
          if (isMounted) setProducts(res);
        } else {
          const res = await getProducts({ isActive: true });
          if (isMounted) setProducts(res);
        }
      } catch (err) {
        console.error('Error al cargar productos de la marca:', err);
      } finally {
        if (isMounted) setIsProductsLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentBrand]);

  const brandName = currentBrand?.name || decodeURIComponent(slug).replace(/-/g, ' ');
  const initials = brandName.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#3483fa] transition-colors">
          Inicio
        </Link>
        <TbChevronRight size={12} />
        <Link href="/brands" className="hover:text-[#3483fa] transition-colors">
          Marcas Oficiales
        </Link>
        <TbChevronRight size={12} />
        <span className="text-gray-800 font-medium capitalize">{brandName}</span>
      </nav>

      {/* Encabezado de la Marca */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-2xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center p-3 text-gray-800 border border-gray-100 shadow-2xs shrink-0">
            {currentBrand?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentBrand.logoUrl}
                alt={brandName}
                className="max-h-16 max-w-full object-contain"
              />
            ) : (
              <span className="font-black text-2xl text-gray-900 tracking-tight">
                {initials}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-light text-[#333] capitalize">
                {brandName}
              </h1>
              <span className="bg-[#00a650] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Tienda Oficial
              </span>
            </div>

            {currentBrand?.description && (
              <p className="text-xs text-gray-600 mt-1.5 max-w-xl leading-relaxed">
                {currentBrand.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>
                {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </span>

              {currentBrand?.website && (
                <a
                  href={currentBrand.website.startsWith('http') ? currentBrand.website : `https://${currentBrand.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#3483fa] hover:underline"
                >
                  <span>Sitio oficial</span>
                  <TbExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>

        <Link
          href="/brands"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3483fa] hover:text-blue-700 transition-colors self-start md:self-center"
        >
          <TbArrowLeft size={15} />
          <span>Ver todas las marcas</span>
        </Link>
      </div>

      {/* Catálogo de Productos de la Marca */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Catálogo de {brandName}
          </h2>
          <span className="text-xs text-gray-400">
            {products.length} items
          </span>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 border border-gray-100 shadow-2xs animate-pulse flex flex-col justify-between h-72"
              >
                <div className="w-full aspect-square bg-gray-100 rounded-md mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-2xs max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center mx-auto mb-3">
              <TbBuildingStore size={26} />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              No hay productos registrados para {brandName}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Pronto se incorporarán artículos de esta marca al catálogo.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-brand text-gray-900 font-bold text-xs rounded-xl shadow-2xs hover:bg-yellow-400 transition-colors"
            >
              <span>Explorar otros productos</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  title: product.title,
                  price: Number(product.price),
                  originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
                  discount: product.discount ?? undefined,
                  freeShipping: product.freeShipping,
                  full: product.full,
                  imageUrl: product.imageUrl,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
