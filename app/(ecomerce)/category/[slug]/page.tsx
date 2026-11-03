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
  TbTools
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
  TbCategory
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { categories, fetchCategories, isLoading: categoriesLoading } = useCategoryStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Encontrar la categoría actual por slug, id o href
  const currentCategory = categories.find((cat) => {
    const slugFromName = cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slugFromHref = cat.href?.replace(/^\/category\//, '');
    return (
      cat.id === slug ||
      slugFromHref === slug ||
      slugFromName === slug
    );
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
          // Si no encontramos la categoría por ID aún, buscar todos los productos
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
    (currentCategory.icon.startsWith('http') || currentCategory.icon.startsWith('data:') || currentCategory.icon.startsWith('/'))
  );
  const IconComponent = (currentCategory?.icon && iconMap[currentCategory.icon]) ? iconMap[currentCategory.icon] : TbCategory;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-7 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#3483fa] transition-colors">
          Inicio
        </Link>
        <TbChevronRight size={12} />
        <Link href="/categories" className="hover:text-[#3483fa] transition-colors">
          Categorías
        </Link>
        <TbChevronRight size={12} />
        <span className="text-gray-800 font-medium capitalize">{categoryName}</span>
      </nav>

      {/* Encabezado de la Categoría */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center p-3 text-gray-700 border border-gray-100 shrink-0">
            {isImage && currentCategory?.icon ? (
              <img
                src={currentCategory.icon}
                alt={categoryName}
                className="w-full h-full object-contain"
              />
            ) : (
              <IconComponent size={32} className="text-[#333]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-light text-[#333] capitalize">
                {categoryName}
              </h1>
              {currentCategory?.badge && (
                <span className="bg-[#00a650] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentCategory.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>
          </div>
        </div>

        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3483fa] hover:text-blue-700 transition-colors"
        >
          <TbArrowLeft size={14} />
          Ver todas las categorías
        </Link>
      </div>

      {/* Listado de Productos */}
      {isProductsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded p-4 h-72 animate-pulse flex flex-col justify-between border border-gray-100">
              <div className="w-full aspect-square bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 max-w-lg mx-auto shadow-xs">
          <TbFilter size={46} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">Sin productos disponibles</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Aún no hay productos asociados a esta categoría o disponibles en stock.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#3483fa] hover:bg-blue-600 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors shadow-xs"
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
  );
}
