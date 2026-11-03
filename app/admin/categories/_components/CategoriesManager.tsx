'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TbSearch, 
  TbPlus, 
  TbRefresh, 
  TbPencil, 
  TbTrash, 
  TbCategory, 
  TbCheck, 
  TbX,
  TbDeviceLaptop, 
  TbDeviceMobile, 
  TbToolsKitchen2, 
  TbArmchair, 
  TbShirt, 
  TbBarbell, 
  TbTools, 
  TbCar, 
  TbShoppingCart, 
  TbHorseToy, 
  TbDeviceGamepad2, 
  TbDeviceTv,
  TbArrowUpRight
} from 'react-icons/tb';
import { useCategoryStore } from '@/stores/category.store';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/category.types';
import { CategoryFormModal } from './CategoryFormModal';
import { DeleteCategoryConfirmModal } from './DeleteCategoryConfirmModal';

const iconComponentMap: Record<string, React.ElementType> = {
  TbDeviceLaptop,
  TbDeviceMobile,
  TbToolsKitchen2,
  TbArmchair,
  TbShirt,
  TbBarbell,
  TbTools,
  TbCar,
  TbShoppingCart,
  TbHorseToy,
  TbDeviceGamepad2,
  TbDeviceTv,
  TbCategory
};

export function CategoriesManager() {
  const { 
    categories, 
    isLoading, 
    fetchCategories, 
    addCategory, 
    editCategory, 
    removeCategory 
  } = useCategoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtrado reactivo en tiempo real
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) => 
        cat.name.toLowerCase().includes(query) || 
        cat.href.toLowerCase().includes(query) ||
        (cat.badge && cat.badge.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  // Manejo de Crear / Editar
  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    if (selectedCategory) {
      await editCategory(selectedCategory.id, data);
      showToast(`Categoría "${data.name || selectedCategory.name}" actualizada con éxito.`);
    } else {
      await addCategory(data as CreateCategoryDto);
      showToast(`Categoría "${data.name}" creada con éxito.`);
    }
  };

  // Manejo de Eliminación física
  const handleOpenDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    await removeCategory(id);
    showToast('Categoría eliminada físicamente de la base de datos.');
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
              Gestión de Categorías
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3483fa] border border-blue-100">
              {categories.length} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Administra las categorías de productos, sus identificadores y su visibilidad en el e-commerce.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchCategories(true)}
            disabled={isLoading}
            className="p-2 sm:px-3 sm:py-2 border border-gray-200 hover:bg-white text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer bg-gray-50/50"
            title="Recargar desde la base de datos"
          >
            <TbRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-[#3483fa] hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <TbPlus size={17} />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Buscador y Resumen (Sin card contenedora, directo y compacto) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1 max-w-sm">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, slug o insignia..."
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
          Mostrando <strong>{filteredCategories.length}</strong> de {categories.length} categorías
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {isLoading && categories.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-gray-400">
            <div className="w-8 h-8 border-3 border-[#3483fa] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando categorías de la base de datos...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
              <TbCategory size={24} />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-sm font-semibold text-gray-800">
                  No se encontraron resultados
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  No hay categorías que coincidan con &ldquo;{searchQuery}&rdquo;.
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
                  No hay categorías registradas
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  La tabla está vacía. Comienza registrando tu primera categoría para tu tienda.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#3483fa] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <TbPlus size={15} />
                  <span>Crear Primera Categoría</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-2 px-4">Categoría</th>
                  <th className="py-2 px-4">Ruta / Slug</th>
                  <th className="py-2 px-4">Ícono</th>
                  <th className="py-2 px-4">Insignia</th>
                  <th className="py-2 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredCategories.map((cat) => {
                  const IconComp = (cat.icon && iconComponentMap[cat.icon]) ? iconComponentMap[cat.icon] : TbCategory;

                  return (
                    <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Categoría e Ícono / Imagen */}
                      <td className="py-2 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-800 shrink-0">
                            {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:')) ? (
                              <img 
                                src={cat.icon} 
                                alt={cat.name} 
                                className="w-full h-full object-contain p-0.5" 
                              />
                            ) : (
                              <IconComp size={16} />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-[13px]">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline" title={cat.id}>
                              ({cat.id.slice(0, 6)}...)
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Ruta */}
                      <td className="py-2 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/60 inline-flex items-center gap-1">
                          {cat.href}
                          <a 
                            href={cat.href} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-gray-400 hover:text-[#3483fa]"
                            title="Probar enlace"
                          >
                            <TbArrowUpRight size={11} />
                          </a>
                        </span>
                      </td>

                      {/* Imagen / Cloudinary */}
                      <td className="py-2 px-4 whitespace-nowrap">
                        {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:')) ? (
                          <a
                            href={cat.icon}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#3483fa] hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <span>Ver en Cloudinary</span>
                            <TbArrowUpRight size={11} />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">
                            {cat.icon || 'Sin imagen'}
                          </span>
                        )}
                      </td>

                      {/* Badge */}
                      <td className="py-2 px-4 whitespace-nowrap">
                        {cat.badge ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {cat.badge}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Botones de Acción */}
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1 text-gray-500 hover:text-[#3483fa] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Editar categoría"
                          >
                            <TbPencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(cat)}
                            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Eliminar físicamente de la base de datos"
                          >
                            <TbTrash size={15} />
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

      {/* Modal de Crear / Editar */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory}
      />

      {/* Modal de Confirmación de Eliminación Física */}
      <DeleteCategoryConfirmModal
        isOpen={isDeleteModalOpen}
        category={selectedCategory}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
