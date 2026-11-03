'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TbSearch,
  TbPlus,
  TbRefresh,
  TbPencil,
  TbTrash,
  TbBox,
  TbCheck,
  TbX,
  TbTruck,
  TbBolt,
} from 'react-icons/tb';
import { useProductStore } from '@/stores/product.store';
import { Product } from '@/types/product.types';
import { DeleteProductConfirmModal } from './DeleteProductConfirmModal';

export function ProductsManager() {
  const {
    products,
    isLoading,
    fetchProducts,
    removeProduct,
  } = useProductStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtrado reactivo en tiempo real
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.category && p.category.name.toLowerCase().includes(query)) ||
        (p.brand && p.brand.name.toLowerCase().includes(query)),
    );
  }, [products, searchQuery]);

  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      setIsDeleting(true);
      await removeProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      showToast(`Producto "${selectedProduct.title}" eliminado de la base de datos.`);
    } catch {
      showToast('Error al eliminar el producto.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs sm:text-sm font-medium py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <div className="p-1 rounded-full bg-emerald-500 text-white">
            <TbCheck size={14} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Gestión de Productos
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3483fa] border border-blue-100">
              {products.length} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Administra el catálogo de productos, precios, inventario y disponibilidad en la tienda.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchProducts(true)}
            disabled={isLoading}
            className="p-2 sm:px-3 sm:py-2 border border-gray-200 hover:bg-white text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer bg-gray-50/50"
            title="Recargar desde la base de datos"
          >
            <TbRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#3483fa] hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <TbPlus size={17} />
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      {/* Buscador y Resumen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1 max-w-sm">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, SKU, marca o categoría..."
            className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-8 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <TbX size={14} />
            </button>
          )}
        </div>

        {/* Resumen */}
        <div className="text-xs text-gray-500">
          Mostrando <strong>{filteredProducts.length}</strong> de {products.length} productos
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-gray-400">
            <div className="w-8 h-8 border-3 border-[#3483fa] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando productos de la base de datos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
              <TbBox size={24} />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-sm font-semibold text-gray-800">
                  No se encontraron resultados
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  No hay productos que coincidan con &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-[#3483fa] hover:underline font-medium"
                >
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-800">
                  No hay productos registrados
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  El catálogo está vacío. Comienza registrando tu primer producto en la tienda.
                </p>
                <Link
                  href="/admin/products/new"
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#3483fa] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <TbPlus size={15} />
                  <span>Crear Primer Producto</span>
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-2 px-4">Producto</th>
                  <th className="py-2 px-4">Categoría</th>
                  <th className="py-2 px-4">Marca</th>
                  <th className="py-2 px-4">Precio</th>
                  <th className="py-2 px-4">Stock</th>
                  <th className="py-2 px-4">Envío</th>
                  <th className="py-2 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredProducts.map((product) => {
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Producto con Miniatura */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-2xs">
                            {product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <TbBox size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <span className="font-semibold text-gray-900 text-[13px] block truncate" title={product.title}>
                              {product.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {product.sku && (
                                <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1 rounded">
                                  {product.sku}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-mono truncate">
                                /product/{product.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {product.category ? (
                          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Marca */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {product.brand ? (
                          <span className="font-semibold text-gray-800 text-xs">
                            {product.brand.name}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Precio */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 text-xs">
                          S/ {Number(product.price).toFixed(2)}
                        </div>
                        {product.costPrice && Number(product.costPrice) > 0 && (
                          <div className="text-[10px] text-gray-500 font-medium">
                            Costo: S/ {Number(product.costPrice).toFixed(2)}
                          </div>
                        )}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                            <span className="text-gray-400 line-through">
                              S/ {Number(product.originalPrice).toFixed(2)}
                            </span>
                            {product.discount && (
                              <span className="text-emerald-600 font-bold">
                                {product.discount}% OFF
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          product.stock <= 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : product.stock <= 5
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {product.stock} unids.
                        </span>
                      </td>

                      {/* Envíos */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {product.freeShipping && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#00a650] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title="Envío Gratis">
                              <TbTruck size={13} />
                              <span>Gratis</span>
                            </span>
                          )}
                          {product.full && (
                            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-black text-[#00a650] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title="Envío Full">
                              <TbBolt size={13} />
                              <span>FULL</span>
                            </span>
                          )}
                          {!product.freeShipping && !product.full && (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1 text-gray-500 hover:text-[#3483fa] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Editar producto"
                          >
                            <TbPencil size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(product)}
                            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Eliminar producto"
                          >
                            <TbTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <DeleteProductConfirmModal
        isOpen={isDeleteModalOpen}
        product={selectedProduct}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
