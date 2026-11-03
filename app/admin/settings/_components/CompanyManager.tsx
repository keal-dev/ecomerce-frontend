'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TbBuilding, 
  TbUpload, 
  TbMail, 
  TbPhone, 
  TbDeviceFloppy, 
  TbAlertCircle, 
  TbCheck, 
  TbBrandFacebook, 
  TbBrandInstagram, 
  TbBrandTiktok,
  TbFileText,
  TbPhoto,
  TbTrash
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { UpdateCompanyDto } from '@/types/company.types';

// 10 Colores Base con más cuerpo, saturación y presencia comercial (sin perder contraste con texto oscuro)
const BRAND_BASE_COLORS = [
  { name: 'Amarillo Mercado', hex: '#FFE600' },
  { name: 'Azul Celeste Vivo', hex: '#38BDF8' },
  { name: 'Verde Esmeralda', hex: '#4ADE80' },
  { name: 'Naranja Comercial', hex: '#FB923C' },
  { name: 'Púrpura Lavanda', hex: '#A78BFA' },
  { name: 'Rosa Vibrante', hex: '#F472B6' },
  { name: 'Turquesa Eléctrico', hex: '#22D3EE' },
  { name: 'Lima Ácido', hex: '#A3E635' },
  { name: 'Ámbar Dorado', hex: '#FBBF24' },
  { name: 'Gris Titanio', hex: '#CBD5E1' },
];

export function CompanyManager() {
  const { company, isLoading, isSaving, error, fetchCompany, updateCompanyData, uploadLogo } = useCompanyStore();

  const [formData, setFormData] = useState<UpdateCompanyDto>({
    name: 'MercadoAdmin',
    legalName: '',
    taxId: '',
    logoUrl: '',
    logoPublicId: '',
    primaryColor: '#ffe600',
    slogan: '',
    email: '',
    phone: '',
    address: '',
    currency: 'PEN',
    currencySymbol: 'S/',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || 'MercadoAdmin',
        legalName: company.legalName || '',
        taxId: company.taxId || '',
        logoUrl: company.logoUrl || '',
        logoPublicId: company.logoPublicId || '',
        primaryColor: company.primaryColor || '#ffe600',
        slogan: company.slogan || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        currency: company.currency || 'PEN',
        currencySymbol: company.currencySymbol || 'S/',
        facebookUrl: company.facebookUrl || '',
        instagramUrl: company.instagramUrl || '',
        tiktokUrl: company.tiktokUrl || '',
      });
      setLogoPreview(company.logoUrl || '');
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'primaryColor' && value) {
      document.documentElement.style.setProperty('--brand-primary', value);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setFormData((prev) => ({
      ...prev,
      currency,
      currencySymbol: currency === 'PEN' ? 'S/' : '$',
    }));
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError('La imagen no debe superar los 5MB.');
      return;
    }

    setLocalError(null);
    setIsUploadingLogo(true);

    // Vista previa inmediata con FileReader
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setLogoPreview(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const uploadRes = await uploadLogo(file);
      setFormData((prev) => ({
        ...prev,
        logoUrl: uploadRes.url,
        logoPublicId: uploadRes.publicId,
      }));
      setSuccessMessage('Logo subido correctamente a Cloudinary.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setLocalError('No se pudo subir el logo a Cloudinary. Se mantendrá la previsualización local.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setFormData((prev) => ({
      ...prev,
      logoUrl: '',
      logoPublicId: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!formData.name?.trim()) {
      setLocalError('El Nombre Comercial de la empresa es obligatorio.');
      return;
    }

    try {
      await updateCompanyData(formData);
      setSuccessMessage('¡Información de la empresa guardada exitosamente!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la información';
      setLocalError(msg);
    }
  };

  if (isLoading && !company) {
    return (
      <div className="max-w-4xl bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs text-gray-500 font-medium">Cargando datos de la empresa...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {/* Alertas de Notificación */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <TbCheck className="text-emerald-600 shrink-0 text-base" />
            <span>{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {(error || localError) && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <TbAlertCircle className="text-rose-600 shrink-0 text-base" />
            <span>{localError || error}</span>
          </div>
          <button type="button" onClick={() => setLocalError(null)} className="text-rose-700 hover:text-rose-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Cabecera del Administrador de la Empresa con Botón de Guardar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200/80">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            Datos de la Empresa & Marca
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configura el nombre comercial, logotipo, datos fiscales y canales de contacto.
          </p>
        </div>
      </div>

      {/* Contenedor de Bloques del Formulario */}
      <div className="space-y-5">

          {/* Bloque 1: Identidad y Marca */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <TbPhoto size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Identidad Visual & Marca</h2>
                <p className="text-[11px] text-gray-500">Logo, nombre comercial y color característico de tu tienda.</p>
              </div>
            </div>

            {/* Subida de Logo */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Logotipo del Negocio
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-gray-50/70 border border-dashed border-gray-300 rounded-xl">
                {/* Cuadro de previsualización */}
                <div className="w-24 h-24 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative group">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={logoPreview} 
                      alt="Logo empresa" 
                      className="w-full h-full object-contain p-1.5" 
                    />
                  ) : (
                    <div className="text-center p-2">
                      <TbPhoto className="mx-auto text-gray-300 text-2xl mb-0.5" />
                      <span className="text-[9px] text-gray-400 block font-medium">Sin logo</span>
                    </div>
                  )}

                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Acciones de carga */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-xs text-gray-600">
                    Sube una imagen cuadrada o rectangular en formato <span className="font-semibold text-gray-900">PNG, JPG, SVG o WebP</span> (máx. 5MB).
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <TbUpload size={14} />
                      <span>{logoPreview ? 'Cambiar logo' : 'Subir logo'}</span>
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <TbTrash size={13} />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Nombre Comercial y Eslogan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre Comercial <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="Ej. Mi Tienda Express"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Eslogan / Lema Comercial
                </label>
                <input
                  type="text"
                  name="slogan"
                  value={formData.slogan || ''}
                  onChange={handleChange}
                  placeholder="Ej. Calidad y precio justo"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>

            {/* 10 Colores Base del Sistema */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800">
                    Color Principal de Marca (10 Colores Base)
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Tonalidades calibradas para garantizar la visibilidad de los textos e íconos.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-50 border border-gray-200/90 px-2 py-0.5 rounded-md">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <span className="text-[11px] font-bold text-gray-800">
                    {BRAND_BASE_COLORS.find((c) => c.hex.toLowerCase() === formData.primaryColor?.toLowerCase())?.name || 'Personalizado'}
                  </span>
                  <span className="font-mono text-[10px] text-gray-400">
                    {formData.primaryColor?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Grid compacto de 10 colores base */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {BRAND_BASE_COLORS.map((color) => {
                  const isSelected = formData.primaryColor?.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      title={`${color.name} (${color.hex})`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, primaryColor: color.hex }));
                        document.documentElement.style.setProperty('--brand-primary', color.hex);
                      }}
                      className={`px-2 py-1.5 rounded-lg border text-left transition-all duration-150 cursor-pointer flex items-center gap-1.5 relative ${
                        isSelected 
                          ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50 shadow-2xs font-semibold' 
                          : 'border-gray-200/90 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                      }`}
                    >
                      <div 
                        className="w-3.5 h-3.5 rounded border border-black/15 shadow-2xs shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <TbCheck size={10} className="text-gray-900 stroke-2" />
                        )}
                      </div>

                      <span className="text-[11px] text-gray-800 leading-tight truncate">
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bloque 2: Información Fiscal y Legal */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TbFileText size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Datos Legales & Fiscales</h2>
                <p className="text-[11px] text-gray-500">Datos impresos en facturas, boletas y notas de venta.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Razón Social (Nombre Legal)
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName || ''}
                  onChange={handleChange}
                  placeholder="Ej. Inversiones & Comercio S.A.C."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  RUC / Identificación Fiscal
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId || ''}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="Ej. 20601234567"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Dirección Fiscal o Principal
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Ej. Av. República de Panamá 3505, Lima"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Moneda Oficial
                </label>
                <select
                  value={formData.currency || 'PEN'}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                >
                  <option value="PEN">PEN (Soles - S/)</option>
                  <option value="USD">USD (Dólares - $)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bloque 3: Contacto y Canales Oficiales */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TbPhone size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Contacto & Atención</h2>
                <p className="text-[11px] text-gray-500">Canales visibles para tus clientes y confirmación de pedidos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Correo Electrónico de Contacto
                </label>
                <div className="relative">
                  <TbMail className="absolute left-3 top-2.5 text-gray-400" size={15} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="contacto@mitienda.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Teléfono / WhatsApp de Soporte
                </label>
                <div className="relative">
                  <TbPhone className="absolute left-3 top-2.5 text-gray-400" size={15} />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="+51 987 654 321"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Enlaces a Redes Sociales
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <TbBrandInstagram className="absolute left-3 top-2.5 text-pink-500" size={15} />
                  <input
                    type="text"
                    name="instagramUrl"
                    value={formData.instagramUrl || ''}
                    onChange={handleChange}
                    placeholder="Instagram URL"
                    className="w-full pl-9 pr-3 py-2 text-[11px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
                <div className="relative">
                  <TbBrandFacebook className="absolute left-3 top-2.5 text-blue-600" size={15} />
                  <input
                    type="text"
                    name="facebookUrl"
                    value={formData.facebookUrl || ''}
                    onChange={handleChange}
                    placeholder="Facebook URL"
                    className="w-full pl-9 pr-3 py-2 text-[11px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
                <div className="relative">
                  <TbBrandTiktok className="absolute left-3 top-2.5 text-gray-900" size={15} />
                  <input
                    type="text"
                    name="tiktokUrl"
                    value={formData.tiktokUrl || ''}
                    onChange={handleChange}
                    placeholder="TikTok URL"
                    className="w-full pl-9 pr-3 py-2 text-[11px] bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
              </div>
          </div>
        </div>

        {/* Barra de Acciones Inferior para Guardar Cambios */}
        <div className="pt-2 flex items-center justify-end border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving || isUploadingLogo}
            className="py-2.5 px-6 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando información...</span>
              </>
            ) : (
              <>
                <TbDeviceFloppy size={16} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
