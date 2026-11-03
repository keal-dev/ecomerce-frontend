'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  TbUsers, 
  TbPlus, 
  TbSearch, 
  TbRefresh, 
  TbPencil, 
  TbTrash, 
  TbCheck, 
  TbX,
  TbCrown,
  TbBuilding,
  TbShoppingCart,
  TbMail,
  TbPhone,
} from 'react-icons/tb';
import { User, UserRole, CreateUserDto, UpdateUserDto } from '@/types/user.types';
import { useUserStore } from '@/stores/user.store';
import { UserFormModal } from './UserFormModal';
import { DeleteUserConfirmModal } from './DeleteUserConfirmModal';

export function UsersManager() {
  const {
    users,
    isLoading,
    fetchUsers,
    addUser,
    editUser,
    toggleUserStatus,
    removeUser,
  } = useUserStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Contadores
  const counts = useMemo(() => {
    return {
      total: users.length,
      superAdmin: users.filter((u) => u.role === 'super_admin').length,
      admin: users.filter((u) => u.role === 'admin').length,
      seller: users.filter((u) => u.role === 'seller').length,
      client: users.filter((u) => u.role === 'client').length,
    };
  }, [users]);

  // Filtrado reactivo en tiempo real
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filtro por rol
      if (selectedRoleFilter !== 'ALL' && user.role !== selectedRoleFilter) {
        return false;
      }

      // Búsqueda por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = user.email.toLowerCase();
        const phone = (user.phone || '').toLowerCase();

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
      }

      return true;
    });
  }, [users, selectedRoleFilter, searchQuery]);

  const handleOpenEditModal = (user: User) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (dto: CreateUserDto | UpdateUserDto) => {
    if (userToEdit) {
      await editUser(userToEdit.id, dto as UpdateUserDto);
      showToast('Usuario y permisos actualizados correctamente');
    } else {
      await addUser(dto as CreateUserDto);
      showToast('Nuevo usuario creado exitosamente');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    await removeUser(userToDelete.id);
    showToast('Usuario eliminado correctamente');
  };

  // Alternar estado Activo / Inactivo con 1 clic desde la tabla
  const handleToggleActive = async (user: User) => {
    try {
      const updated = await toggleUserStatus(user.id);
      showToast(
        `Usuario «${updated.firstName || updated.email}» ${
          updated.isActive ? 'habilitado' : 'deshabilitado'
        } correctamente.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
      showToast(msg);
    }
  };

  // Renderizar insignia de rol
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs">
            <TbCrown size={12} className="text-amber-600" />
            <span>Super Admin</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
            <TbBuilding size={12} className="text-[#3483fa]" />
            <span>Administrador</span>
          </span>
        );
      case 'seller':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 shadow-2xs">
            <TbShoppingCart size={12} className="text-purple-600" />
            <span>Vendedor</span>
          </span>
        );
      case 'client':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">
            <TbUsers size={12} className="text-gray-500" />
            <span>Cliente</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notificación flotante */}
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
              Usuarios y Roles
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3483fa] border border-blue-100">
              {users.length} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gestiona los niveles de acceso del personal: Super Administradores, Administradores y Vendedores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Recargar lista de usuarios"
          >
            <TbRefresh size={17} className={isLoading ? 'animate-spin' : ''} />
            <span className="text-xs font-semibold hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen por Rol */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div 
          onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'super_admin' ? 'ALL' : 'super_admin')}
          className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedRoleFilter === 'super_admin'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-2xs'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <TbCrown size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-gray-500 block truncate leading-tight">Super Admins</span>
              <span className="text-base font-bold text-gray-900 leading-tight">{counts.superAdmin}</span>
            </div>
          </div>
          {selectedRoleFilter === 'super_admin' && (
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          )}
        </div>

        <div 
          onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'admin' ? 'ALL' : 'admin')}
          className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedRoleFilter === 'admin'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/20 shadow-2xs'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#3483fa] flex items-center justify-center shrink-0">
              <TbBuilding size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-gray-500 block truncate leading-tight">Administradores</span>
              <span className="text-base font-bold text-gray-900 leading-tight">{counts.admin}</span>
            </div>
          </div>
          {selectedRoleFilter === 'admin' && (
            <span className="w-2 h-2 rounded-full bg-[#3483fa] shrink-0" />
          )}
        </div>

        <div 
          onClick={() => setSelectedRoleFilter(selectedRoleFilter === 'seller' ? 'ALL' : 'seller')}
          className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedRoleFilter === 'seller'
              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/20 shadow-2xs'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <TbShoppingCart size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-gray-500 block truncate leading-tight">Vendedores</span>
              <span className="text-base font-bold text-gray-900 leading-tight">{counts.seller}</span>
            </div>
          </div>
          {selectedRoleFilter === 'seller' && (
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
          )}
        </div>

        <div 
          onClick={() => setSelectedRoleFilter('ALL')}
          className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
            selectedRoleFilter === 'ALL'
              ? 'bg-gray-100 border-gray-300 ring-2 ring-gray-400/20 shadow-2xs'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
              <TbUsers size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-gray-500 block truncate leading-tight">Total Usuarios</span>
              <span className="text-base font-bold text-gray-900 leading-tight">{counts.total}</span>
            </div>
          </div>
          {selectedRoleFilter === 'ALL' && (
            <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
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
          Mostrando <strong>{filteredUsers.length}</strong> de {users.length} usuarios
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-gray-400">
            <div className="w-8 h-8 border-3 border-[#3483fa] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando usuarios de la base de datos...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
              <TbUsers size={24} />
            </div>
            {searchQuery || selectedRoleFilter !== 'ALL' ? (
              <>
                <h3 className="text-sm font-semibold text-gray-800">
                  No se encontraron resultados
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  No hay usuarios que coincidan con los filtros aplicados.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRoleFilter('ALL');
                  }}
                  className="mt-3 text-xs text-[#3483fa] hover:underline font-medium"
                >
                  Restablecer filtros
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-800">
                  No hay usuarios registrados aún
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Los usuarios se registran automáticamente al iniciar sesión en la tienda con Clerk. Cuando una persona inicie sesión, aparecerá aquí para que puedas asignarle su rol.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-4">Usuario</th>
                  <th className="py-2.5 px-4">Rol / Nivel</th>
                  <th className="py-2.5 px-4">Teléfono</th>
                  <th className="py-2.5 px-4">Estado</th>
                  <th className="py-2.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredUsers.map((user) => {
                  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Sin nombre';
                  const initials = (user.firstName?.[0] || user.email[0] || 'U').toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Usuario */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {user.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.imageUrl}
                              alt={fullName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#3483fa] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900 text-[13px]">
                              {fullName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                              <TbMail size={12} className="text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rol / Nivel */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {renderRoleBadge(user.role)}
                      </td>

                      {/* Teléfono */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {user.phone ? (
                          <div className="flex items-center gap-1 font-mono text-xs text-gray-700">
                            <TbPhone size={13} className="text-gray-400 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            user.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={user.isActive ? 'Clic para deshabilitar usuario' : 'Clic para habilitar usuario'}
                        >
                          <span 
                            className={`w-2 h-2 rounded-full transition-transform ${
                              user.isActive ? 'bg-emerald-500 shadow-xs' : 'bg-gray-400'
                            }`}
                          />
                          <span className="text-[11px]">
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1 text-gray-500 hover:text-[#3483fa] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Editar rol y permisos"
                          >
                            <TbPencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(user)}
                            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Eliminar usuario"
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

      {/* Modal Formulario de Creación / Edición */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={userToEdit}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteUserConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={userToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
