'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  TbChevronRight,
  TbCategory,
  TbFilter,
  TbArrowLeft,
  TbDeviceMobile,
  TbDeviceLaptop,
  TbDeviceGamepad2,
  TbDeviceTv,
  TbShirt,
  TbShoe,
  TbArmchair,
  TbToolsKitchen2,
  TbCar,
  TbBarbell,
  TbHorseToy,
  TbShoppingCart,
  TbTools,
} from 'react-icons/tb';
import { useCategoryStore } from '@/stores/category.store';
import { ProductCard } from '@/app/(ecomerce)/_components/ProductCard';
import { getProducts } from '@/services/product.service';
import { Product } from '@/types/product.types';

const iconMap: Record<string, React.ElementType> = {
  TbDeviceMobile,
  TbDeviceLaptop,
  TbDeviceGamepad2,
  TbDeviceTv,
  TbShirt,
  TbShoe,
  TbArmchair,
  TbToolsKitchen2,
  TbCar,
  TbBarbell,
  TbHorseToy,
  TbShoppingCart,
  TbTools,
  TbCategory,
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { categories, fetchCategories } = useCategoryStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const currentCategory = categories.find((cat) => {
    const slugFromName = cat.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slugFromHref = cat.href?.replace(/^\/category\//, '');
    return cat.id === slug || slugFromHref === slug || slugFromName === slug;
  });

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setIsProductsLoading(true);
      try {
        if (currentCategory) {
          const res = await getProducts({ categoryId: currentCategory.id, isActive: true });
          if (isMounted) setProducts(res);
        } else {
          const res = await getProducts({ isActive: true });
          if (isMounted) setProducts(res);
        }
      } catch (err) {
        console.error('Error al cargar productos de la categoría:', err);
      } finally {
        if (isMounted) setIsProductsLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentCategory]);

  const categoryName = currentCategory?.name || decodeURIComponent(slug).replace(/-/g, ' ');
  const isImage = Boolean(
    currentCategory?.icon &&
      (currentCategory.icon.startsWith('http') ||
        currentCategory.icon.startsWith('data:') ||
        currentCategory.icon.startsWith('/')),
  );
  const IconComponent =
    currentCategory?.icon && iconMap[currentCategory.icon]
      ? iconMap[currentCategory.icon]
      : TbCategory;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-[#de2a2a] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={12} />
          <Link href="/categories" className="hover:text-[#de2a2a] transition-colors">
            Categorías
          </Link>
          <TbChevronRight size={12} />
          <span className="text-black font-bold capitalize">{categoryName}</span>
        </nav>

        {/* Encabezado de la Categoría */}
        <div className="bg-black text-white rounded-none p-6 sm:p-8 border-b-4 border-[#de2a2a] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-none bg-white flex items-center justify-center p-2.5 text-black border border-[#262626] shrink-0">
              {isImage && currentCategory?.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentCategory.icon}
                  alt={categoryName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <IconComponent size={32} className="text-black" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white">
                  {categoryName}
                </h1>
                {currentCategory?.badge && (
                  <span className="bg-[#de2a2a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-none uppercase tracking-wider">
                    {currentCategory.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-300 mt-1 uppercase tracking-wider">
                {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </p>
            </div>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white border border-[#262626] hover:border-[#de2a2a] hover:text-[#de2a2a] px-4 py-2.5 transition-colors self-start md:self-center"
          >
            <TbArrowLeft size={14} />
            Ver todas las categorías
          </Link>
        </div>

        {/* Listado de Productos */}
        {isProductsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#f8f8f8] rounded-none p-4 h-72 animate-pulse flex flex-col justify-between border border-[#d9d9d9]"
              >
                <div className="w-full aspect-square bg-neutral-200 mb-3" />
                <div className="h-4 bg-neutral-200 w-1/2 mb-2" />
                <div className="h-3 bg-neutral-200 w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-[#f8f8f8] rounded-none p-12 text-center border border-[#d9d9d9] max-w-lg mx-auto">
            <TbFilter size={46} className="text-neutral-400 mx-auto mb-3" />
            <h3 className="font-display text-lg font-extrabold uppercase text-black">
              Sin productos disponibles
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 mb-6">
              Aún no hay productos asociados a esta categoría o disponibles en stock.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#de2a2a] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-none transition-colors"
            >
              Volver a la tienda
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
                  slug: product.slug,
                  price: Number(product.price),
                  originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
                  discount: product.discount ?? undefined,
                  freeShipping: product.freeShipping,
                  full: product.full,
                  imageUrl: product.imageUrl,
                  stock: product.stock,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
