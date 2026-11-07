'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TbChevronRight,
  TbTruckDelivery,
  TbCreditCard,
  TbLock,
  TbShieldCheck,
  TbCheck,
  TbArrowLeft,
  TbShoppingBag,
  TbReceipt,
  TbUser,
  TbMapPin,
  TbAlertCircle,
  TbLoader2,
} from 'react-icons/tb';
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa6';
import { useCartStore } from '@/stores/cart.store';
import { useCompanyStore } from '@/stores/company.store';
import { getDepartments, getProvinces, getDistricts } from '@/services/ubigeo.service';
import { DepartmentItem, ProvinceItem, DistrictItem } from '@/types/ubigeo.types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getSubtotal, getTotalItems } = useCartStore();
  const { company, fetchCompany } = useCompanyStore();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{
    orderNumber: string;
    total: number;
    email: string;
    date: string;
  } | null>(null);

  // Estados del Formulario
  const [formData, setFormData] = useState({
    fullName: '',
    docType: 'DNI',
    docNumber: '',
    email: '',
    phone: '',
    department: '',
    province: '',
    district: '',
    address: '',
    reference: '',
    invoiceType: 'boleta', // boleta | factura
    companyRuc: '',
    companyLegalName: '',
    paymentMethod: 'card', // card | yape | transfer
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de Ubigeo
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>('');
  const [selectedProvCode, setSelectedProvCode] = useState<string>('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCompany(true);

    async function loadDepts() {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Error al cargar departamentos:', err);
      }
    }
    loadDepts();
  }, [fetchCompany]);

  const currencySymbol = company?.currencySymbol || 'S/';
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const hasFreeShipping = items.some((item) => item.freeShipping === true);
  const isFreeShipping = hasFreeShipping || subtotal >= 99;
  const shippingCost = isFreeShipping ? 0 : 10;
  const totalToPay = subtotal + shippingCost;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptCode = e.target.value;
    const selected = departments.find((d) => d.departmentCode === deptCode);
    const deptName = selected ? selected.department : '';

    setSelectedDeptCode(deptCode);
    setSelectedProvCode('');
    setProvinces([]);
    setDistricts([]);

    setFormData((prev) => ({
      ...prev,
      department: deptName,
      province: '',
      district: '',
    }));

    if (!deptCode) return;

    setLoadingProvinces(true);
    try {
      const data = await getProvinces(deptCode);
      setProvinces(data);
    } catch (err) {
      console.error('Error al cargar provincias:', err);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provCode = e.target.value;
    const selected = provinces.find((p) => p.provinceCode === provCode);
    const provName = selected ? selected.province : '';

    setSelectedProvCode(provCode);
    setDistricts([]);

    setFormData((prev) => ({
      ...prev,
      province: provName,
      district: '',
    }));

    if (!provCode) return;

    setLoadingDistricts(true);
    try {
      const data = await getDistricts(provCode);
      setDistricts(data);
    } catch (err) {
      console.error('Error al cargar distritos:', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distName = e.target.value;
    setFormData((prev) => ({ ...prev, district: distName }));
  };

  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.docNumber.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo y número de documento.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido para confirmar tu pedido.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('El teléfono de contacto es necesario para coordinar la entrega.');
      return;
    }
    if (!formData.department || !formData.province || !formData.district) {
      setErrorMessage('Por favor selecciona tu Departamento, Provincia y Distrito de entrega.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Por favor escribe tu dirección exacta de entrega.');
      return;
    }

    setIsProcessing(true);

    // Simular procesamiento del pedido
    setTimeout(() => {
      const year = new Date().getFullYear();
      const randomOrder = `ORD-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderDate = new Date().toLocaleString('es-PE', {
        dateStyle: 'long',
        timeStyle: 'short',
      });

      setOrderCompleted({
        orderNumber: randomOrder,
        total: totalToPay,
        email: formData.email,
        date: orderDate,
      });

      clearCart();
      setIsProcessing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <TbLoader2 className="animate-spin text-[#3483fa]" size={36} />
        <p className="text-xs text-gray-500">Cargando pasarela de pago segura...</p>
      </div>
    );
  }

  // PANTALLA DE ÉXITO DE COMPRA
  if (orderCompleted) {
    return (
      <div className="min-h-screen pb-16 pt-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <TbCheck size={32} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                ¡Pedido Realizado con Éxito!
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Gracias por tu compra
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md mx-auto">
                Hemos enviado la confirmación y el detalle de tu compra al correo:{' '}
                <strong className="text-gray-800">{orderCompleted.email}</strong>.
              </p>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Número de Pedido:</span>
                <span className="font-bold text-gray-900">{orderCompleted.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Fecha y Hora:</span>
                <span className="font-medium text-gray-800">{orderCompleted.date}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Método de Pago:</span>
                <span className="font-medium text-gray-800 uppercase">
                  {formData.paymentMethod === 'card' ? 'Tarjeta Bancaria' : formData.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm">
                <span className="font-bold text-gray-900">Total Pagado:</span>
                <span className="font-extrabold text-[#3483fa]">
                  {currencySymbol} {orderCompleted.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors"
              >
                Imprimir Comprobante
              </button>
              <Link
                href="/"
                className="px-6 py-2.5 bg-[#3483fa] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SI EL CARRITO ESTÁ VACÍO
  if (items.length === 0) {
    return (
      <div className="min-h-screen pb-16 pt-8">
        <div className="max-w-md mx-auto px-4 text-center bg-white p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <TbShoppingBag size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Tu carrito está vacío</h2>
          <p className="text-xs text-gray-500">
            No tienes productos seleccionados para iniciar el proceso de compra.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#3483fa] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-light">
          <Link href="/cart" className="hover:text-[#3483fa] transition-colors flex items-center gap-1">
            <TbArrowLeft size={13} />
            Volver al Carrito
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Finalizar Compra Segura</span>
        </nav>

        <form onSubmit={handleProcessOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA: Formulario de Datos y Entrega */}
          <div className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-2xs">
                <TbAlertCircle size={18} className="shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Datos Personales */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <TbUser className="text-[#3483fa]" size={20} />
                <h2 className="font-bold text-gray-900 text-sm">1. Datos del Comprador</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-8">
                  <label className="block font-medium text-gray-700 mb-1">Nombres y Apellidos *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-medium text-gray-700 mb-1">DNI / Documento *</label>
                  <input
                    type="text"
                    name="docNumber"
                    value={formData.docNumber}
                    onChange={handleInputChange}
                    placeholder="N° de documento"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block font-medium text-gray-700 mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="987654321"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Dirección de Entrega (Ubigeo Automático) */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <TbMapPin className="text-[#3483fa]" size={20} />
                <h2 className="font-bold text-gray-900 text-sm">2. Dirección de Entrega y Despacho</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-4">
                  <label className="block font-medium text-gray-700 mb-1">Departamento *</label>
                  <select
                    name="department"
                    value={selectedDeptCode}
                    onChange={handleDepartmentChange}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden cursor-pointer"
                    required
                  >
                    <option value="">-- Departamento --</option>
                    {departments.map((d) => (
                      <option key={d.departmentCode} value={d.departmentCode}>
                        {d.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-medium text-gray-700 mb-1">Provincia *</label>
                  <select
                    name="province"
                    value={selectedProvCode}
                    onChange={handleProvinceChange}
                    disabled={!selectedDeptCode || loadingProvinces}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                    required
                  >
                    <option value="">
                      {loadingProvinces ? 'Cargando...' : !selectedDeptCode ? 'Elige depto' : '-- Provincia --'}
                    </option>
                    {provinces.map((p) => (
                      <option key={p.provinceCode} value={p.provinceCode}>
                        {p.province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-medium text-gray-700 mb-1">Distrito *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvCode || loadingDistricts}
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                    required
                  >
                    <option value="">
                      {loadingDistricts ? 'Cargando...' : !selectedProvCode ? 'Elige prov' : '-- Distrito --'}
                    </option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.district}>
                        {d.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-8">
                  <label className="block font-medium text-gray-700 mb-1">Dirección Exacta (Calle, Jr, Av y N°) *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. Los Sauces 123 Dpto 401"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-medium text-gray-700 mb-1">Referencia</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    placeholder="Frente al parque"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 3. Selección de Medio de Pago */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <TbCreditCard className="text-[#3483fa]" size={20} />
                  <h2 className="font-bold text-gray-900 text-sm">3. Método de Pago</h2>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaCcVisa size={22} className="text-blue-700" />
                  <FaCcMastercard size={22} className="text-red-500" />
                  <FaCcAmex size={22} className="text-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'card'
                      ? 'border-[#3483fa] bg-blue-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-gray-900">Tarjeta Débito / Crédito</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Visa, Mastercard, Amex</div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'yape'
                      ? 'border-[#3483fa] bg-blue-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="yape"
                    checked={formData.paymentMethod === 'yape'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-gray-900">Billeteras Digitales</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Yape / Plin con QR</div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'transfer'
                      ? 'border-[#3483fa] bg-blue-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={formData.paymentMethod === 'transfer'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="font-bold text-gray-900">Transferencia Bancaria</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">BCP, BBVA, Interbank</div>
                </label>
              </div>

              {formData.paymentMethod === 'card' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs animate-in fade-in">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                    <input
                      type="text"
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                      className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs tracking-widest font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Vencimiento (MM/AA)</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <TbLock size={13} /> Pasarela con encriptación SSL 256-bit y certificación de seguridad bancaria.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: Resumen de Pedido y Botón Final */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <h2 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
                Resumen del Pedido ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
              </h2>

              {/* Lista de productos en resumen */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium truncate">{item.title}</p>
                      <p className="text-gray-500 text-[11px]">Cant: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900 shrink-0">
                      {currencySymbol} {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cálculos */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    {currencySymbol} {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <TbTruckDelivery size={15} className="text-[#00a650]" />
                    <span>Costo de Envío:</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {isFreeShipping ? (
                      <span className="text-[#00a650] font-bold uppercase">Gratis</span>
                    ) : (
                      `${currencySymbol} ${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Total a Pagar:</span>
                  <span className="text-xl font-black text-gray-900">
                    {currencySymbol} {totalToPay.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botón de Confirmación y Pago */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-[#3483fa] hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <TbLoader2 className="animate-spin" size={18} />
                    <span>Procesando pago seguro...</span>
                  </>
                ) : (
                  <>
                    <TbLock size={18} />
                    <span>Pagar {currencySymbol} {totalToPay.toFixed(2)}</span>
                  </>
                )}
              </button>

              {/* Sellos de Seguridad */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-500">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <TbShieldCheck size={16} className="shrink-0" />
                  <span>Compra 100% Protegida con garantía de entrega</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <TbLock size={14} className="shrink-0" />
                  <span>Transacción encriptada con cifrado SSL</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

