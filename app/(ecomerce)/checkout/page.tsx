'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  TbChevronRight,
  TbTruckDelivery,
  TbCreditCard,
  TbLock,
  TbShieldCheck,
  TbCheck,
  TbArrowLeft,
  TbShoppingBag,
  TbUser,
  TbMapPin,
  TbAlertCircle,
  TbLoader2,
  TbQrcode,
  TbFileInvoice,
  TbDownload,
  TbSearch,
} from 'react-icons/tb';
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa6';
import { useCartStore } from '@/stores/cart.store';
import { useCompanyStore } from '@/stores/company.store';
import { getDepartments, getProvinces, getDistricts } from '@/services/ubigeo.service';
import { DepartmentItem, ProvinceItem, DistrictItem } from '@/types/ubigeo.types';
import { processCulqiCharge } from '@/services/payment.service';
import { lookupDni, lookupRuc } from '@/services/document-lookup.service';

declare global {
  interface Window {
    Culqi?: any;
    culqi?: () => void;
  }
}

export default function CheckoutPage() {
  const { items, clearCart, getSubtotal, getTotalItems } = useCartStore();
  const { company, fetchCompany } = useCompanyStore();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{
    orderNumber: string;
    total: number;
    email: string;
    date: string;
    invoicePdfUrl?: string | null;
    invoiceSeries?: string | null;
    invoiceNumber?: string | null;
    invoiceType?: string;
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

  // Estados de consulta automática DNI / RUC (Decolecta)
  const [isLookingUpDoc, setIsLookingUpDoc] = useState(false);
  const [docLookupStatus, setDocLookupStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const lastLookedUpDocRef = useRef<string>('');

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

  // Referencias para que el callback global de Culqi siempre acceda al estado actual
  const formDataRef = useRef(formData);
  const totalToPayRef = useRef(totalToPay);
  const companyRef = useRef(company);
  const itemsRef = useRef(items);
  const subtotalRef = useRef(subtotal);
  const shippingCostRef = useRef(shippingCost);

  useEffect(() => {
    formDataRef.current = formData;
    totalToPayRef.current = totalToPay;
    companyRef.current = company;
    itemsRef.current = items;
    subtotalRef.current = subtotal;
    shippingCostRef.current = shippingCost;
  }, [formData, totalToPay, company, items, subtotal, shippingCost]);

  // Listener para el evento de respuesta de Culqi Checkout v4
  useEffect(() => {
    window.culqi = async () => {
      if (window.Culqi?.token) {
        const token = window.Culqi.token.id;
        try {
          window.Culqi.close();
        } catch {
          // ignore
        }
        setIsProcessing(true);
        setErrorMessage(null);

        const currentForm = formDataRef.current;
        const currentTotal = totalToPayRef.current;
        const currentItems = itemsRef.current;
        const currentSubtotal = subtotalRef.current;
        const currentShipping = shippingCostRef.current;

        const nameParts = currentForm.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Cliente';
        const lastName = nameParts.slice(1).join(' ') || 'General';

        const year = new Date().getFullYear();
        const generatedOrderNum = `ORD-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

        try {
          const res = await processCulqiCharge({
            tokenId: token,
            amount: Math.round(currentTotal * 100),
            email: currentForm.email,
            currencyCode: 'PEN',
            description: `Pedido de ${currentForm.fullName} en ${companyRef.current?.name || 'Cooperativa Gourmet'}`,
            firstName,
            lastName,
            address: currentForm.address,
            city: currentForm.province || currentForm.department || 'Lima',
            phoneNumber: currentForm.phone,
            docType: currentForm.docType,
            docNumber: currentForm.docNumber,
            department: currentForm.department,
            province: currentForm.province,
            district: currentForm.district,
            orderNumber: generatedOrderNum,
            subtotal: currentSubtotal,
            shippingCost: currentShipping,
            reference: currentForm.reference,
            invoiceType: currentForm.invoiceType,
            companyRuc: currentForm.companyRuc,
            companyLegalName: currentForm.companyLegalName,
            companyName: companyRef.current?.name || 'Cooperativa Gourmet',
            currencySymbol: companyRef.current?.currencySymbol || 'S/',
            items: currentItems.map((it) => ({
              productId: it.id,
              title: it.title,
              quantity: it.quantity,
              price: it.price,
              imageUrl: it.imageUrl,
            })),
          });

          const finalOrderNum = res.orderNumber || generatedOrderNum;
          const orderDate = new Date().toLocaleString('es-PE', {
            dateStyle: 'long',
            timeStyle: 'short',
          });

          setOrderCompleted({
            orderNumber: finalOrderNum,
            total: currentTotal,
            email: currentForm.email,
            date: orderDate,
            invoicePdfUrl: res.invoice?.pdfUrl,
            invoiceSeries: res.invoice?.series,
            invoiceNumber: res.invoice?.number,
            invoiceType: currentForm.invoiceType,
          });

          // Guardar en el historial local del navegador para acceso sin login
          try {
            const rawStored = localStorage.getItem('my_saved_orders');
            const existingOrders = rawStored ? JSON.parse(rawStored) : [];
            const newEntry = {
              orderNumber: finalOrderNum,
              email: currentForm.email,
              customerName: currentForm.fullName,
              date: orderDate,
              total: currentTotal,
              currencySymbol: companyRef.current?.currencySymbol || 'S/',
              itemsCount: currentItems.reduce((acc, it) => acc + it.quantity, 0),
              invoicePdfUrl: res.invoice?.pdfUrl || null,
              invoiceSeries: res.invoice?.series || null,
              invoiceNumber: res.invoice?.number || null,
            };
            const filtered = existingOrders.filter((o: any) => o.orderNumber !== finalOrderNum);
            localStorage.setItem('my_saved_orders', JSON.stringify([newEntry, ...filtered].slice(0, 30)));
          } catch (e) {
            console.error('Error al guardar pedido en historial local:', e);
          }

          clearCart();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'No se pudo completar el cobro con Culqi. Por favor verifique sus datos o intente nuevamente.';
          setErrorMessage(msg);
        } finally {
          setIsProcessing(false);
        }
      } else if (window.Culqi?.error) {
        setIsProcessing(false);
        const errObj = window.Culqi.error;
        setErrorMessage(
          errObj.user_message || errObj.merchant_message || 'El pago fue cancelado o rechazado por la pasarela.',
        );
      }
    };
  }, [clearCart]);

  const runDocumentLookup = async (
    invoiceType: 'boleta' | 'factura',
    rawNumber: string,
    force = false,
  ) => {
    const clean = rawNumber.replace(/\D/g, '');
    const expectedLen = invoiceType === 'factura' ? 11 : 8;
    if (clean.length !== expectedLen) return;

    const cacheKey = `${invoiceType}:${clean}`;
    if (!force && lastLookedUpDocRef.current === cacheKey) return;
    lastLookedUpDocRef.current = cacheKey;

    setIsLookingUpDoc(true);
    setDocLookupStatus(null);

    try {
      if (invoiceType === 'factura') {
        const res = await lookupRuc(clean);
        setFormData((prev) => ({
          ...prev,
          companyRuc: clean,
          companyLegalName: res.legalName,
        }));
        const extra = [res.status, res.condition].filter(Boolean).join(' · ');
        setDocLookupStatus({
          type: 'success',
          text: extra
            ? `SUNAT: ${res.legalName} (${extra})`
            : `SUNAT: ${res.legalName}`,
        });
      } else {
        const res = await lookupDni(clean);
        setFormData((prev) => ({
          ...prev,
          fullName: res.fullName,
        }));
        setDocLookupStatus({
          type: 'success',
          text: `RENIEC: ${res.fullName}`,
        });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'No se pudo consultar el documento. Puedes escribir tus datos manualmente.';
      setDocLookupStatus({
        type: 'error',
        text: Array.isArray(msg) ? msg.join(', ') : msg,
      });
    } finally {
      setIsLookingUpDoc(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'docNumber') {
      const maxLen = formData.invoiceType === 'factura' ? 11 : 8;
      sanitizedValue = value.replace(/\D/g, '').slice(0, maxLen);
      setDocLookupStatus(null);
      if (sanitizedValue.length < maxLen) {
        lastLookedUpDocRef.current = '';
      }
    } else if (name === 'phone') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (name === 'companyRuc') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 11);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
      ...(name === 'docNumber' && prev.invoiceType === 'factura'
        ? { companyRuc: sanitizedValue }
        : {}),
    }));

    if (name === 'docNumber') {
      const targetLen = formData.invoiceType === 'factura' ? 11 : 8;
      if (sanitizedValue.length === targetLen) {
        void runDocumentLookup(
          formData.invoiceType as 'boleta' | 'factura',
          sanitizedValue,
        );
      }
    }
  };

  const handleInvoiceTypeChange = (type: 'boleta' | 'factura') => {
    lastLookedUpDocRef.current = '';
    setDocLookupStatus(null);
    setFormData((prev) => ({
      ...prev,
      invoiceType: type,
      docType: type === 'factura' ? 'RUC' : 'DNI',
      docNumber: '',
      companyRuc: '',
      companyLegalName: type === 'boleta' ? '' : prev.companyLegalName,
    }));
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

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.invoiceType === 'factura') {
      if (!/^\d{11}$/.test(formData.docNumber.trim())) {
        setErrorMessage('El RUC debe tener exactamente 11 dígitos numéricos (ej. 20601234567).');
        return;
      }
      if (!formData.companyLegalName.trim()) {
        setErrorMessage('Por favor ingresa la Razón Social de la empresa para la factura.');
        return;
      }
      if (!formData.fullName.trim()) {
        setErrorMessage('Por favor ingresa el nombre de la persona o contacto que recibe.');
        return;
      }
    } else {
      if (!/^\d{8}$/.test(formData.docNumber.trim())) {
        setErrorMessage('El DNI debe tener exactamente 8 dígitos numéricos.');
        return;
      }
      if (!formData.fullName.trim()) {
        setErrorMessage('Por favor ingresa tus nombres y apellidos completos.');
        return;
      }
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido para confirmar tu pedido.');
      return;
    }
    if (!/^\d{9}$/.test(formData.phone.trim())) {
      setErrorMessage('El teléfono móvil debe tener exactamente 9 dígitos numéricos (ej. 987654321).');
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

    if (typeof window !== 'undefined' && window.Culqi) {
      try {
        const culqiEnv = (process.env.NEXT_PUBLIC_CULQI_ENV || 'test').toLowerCase();
        const isProd = culqiEnv === 'production' || culqiEnv === 'prod' || culqiEnv === 'live';

        const resolvedPublicKey = isProd
          ? process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY_LIVE ||
            process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
          : process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY_TEST ||
            process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ||
            'pk_test_KSDBPPU0XO3e36qf';

        window.Culqi.publicKey = resolvedPublicKey;

        window.Culqi.settings({
          title: company?.name || 'Cooperativa Gourmet',
          currency: 'PEN',
          amount: Math.round(totalToPay * 100),
        });

        window.Culqi.options({
          lang: 'auto',
          installments: true,
          paymentMethods: {
            tarjeta: true,
            yape: true,
            billetera: true,
            bancaMovil: true,
            agente: true,
            cuotealo: false,
          },
          style: {
            logo: company?.logoUrl || '',
            bannerColor:
              company?.primaryColor && company.primaryColor.toLowerCase() !== '#ffe600'
                ? company.primaryColor
                : '#000000',
            buttonBackground: company?.accentColor || '#de2a2a',
            menuColor:
              company?.primaryColor && company.primaryColor.toLowerCase() !== '#ffe600'
                ? company.primaryColor
                : '#000000',
            linksColor: company?.accentColor || '#de2a2a',
            priceColor:
              company?.primaryColor && company.primaryColor.toLowerCase() !== '#ffe600'
                ? company.primaryColor
                : '#000000',
          },
        });

        window.Culqi.open();
      } catch (err) {
        console.error('Error al inicializar Culqi:', err);
        setErrorMessage('Error al abrir la pasarela Culqi. Por favor verifique su conexión.');
      }
    } else {
      setErrorMessage(
        'La pasarela de pago Culqi aún se está conectando. Por favor espere 2 segundos e intente nuevamente.',
      );
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-3">
        <TbLoader2 className="animate-spin text-brand-accent" size={36} />
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Cargando pasarela de pago segura...
        </p>
      </div>
    );
  }

  // PANTALLA DE ÉXITO DE COMPRA
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-white pb-16 pt-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-none border border-[#d9d9d9] p-6 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-[#2e9e7b] text-white rounded-none flex items-center justify-center mx-auto">
              <TbCheck size={32} />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2e9e7b] block mb-1.5">
                Pedido realizado con éxito
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black">
                Gracias por tu compra
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-md mx-auto">
                Hemos enviado la confirmación y el detalle de tu pedido al correo:{' '}
                <strong className="text-black">{orderCompleted.email}</strong>.
              </p>
            </div>

            <div className="p-5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                <span className="text-neutral-500">Número de Pedido:</span>
                <span className="font-bold font-mono text-black">{orderCompleted.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                <span className="text-neutral-500">Fecha y Hora:</span>
                <span className="font-semibold text-black">{orderCompleted.date}</span>
              </div>
              <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                <span className="text-neutral-500">Método de Pago:</span>
                <span className="font-semibold text-black uppercase">
                  {formData.paymentMethod === 'card' ? 'Tarjeta Bancaria' : formData.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm">
                <span className="font-bold uppercase text-black">Total Pagado:</span>
                <span className="font-display font-extrabold text-brand-accent text-lg">
                  {currencySymbol} {orderCompleted.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Comprobante Electrónico SUNAT */}
            {orderCompleted.invoicePdfUrl && (
              <div className="p-4 bg-[#2e9e7b]/10 border border-[#2e9e7b]/40 rounded-none flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-[#2e9e7b] text-white flex items-center justify-center shrink-0">
                    <TbFileInvoice size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase text-black block">
                      Comprobante Electrónico SUNAT Emitido
                    </span>
                    <span className="text-[11px] text-neutral-700">
                      {orderCompleted.invoiceType === 'factura' ? 'Factura Electrónica' : 'Boleta Electrónica'}:{' '}
                      <strong>{orderCompleted.invoiceSeries}-{orderCompleted.invoiceNumber}</strong> (Aceptada por SUNAT)
                    </span>
                  </div>
                </div>
                <a
                  href={orderCompleted.invoicePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                >
                  <TbDownload size={15} />
                  <span>Descargar PDF</span>
                </a>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href={`/rastreo?order=${encodeURIComponent(orderCompleted.orderNumber)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <TbTruckDelivery size={18} />
                <span>Rastrear pedido</span>
              </Link>
              <Link
                href="/mis-compras"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-none border border-black text-black hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <span>Ver mis compras</span>
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-3 rounded-none border border-[#d9d9d9] text-neutral-700 hover:border-black hover:text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SI EL CARRITO ESTÁ VACÍO
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-16 pt-10">
        <div className="max-w-md mx-auto px-4 text-center bg-[#f8f8f8] p-8 rounded-none border border-[#d9d9d9] space-y-4">
          <div className="w-14 h-14 bg-black text-white rounded-none flex items-center justify-center mx-auto">
            <TbShoppingBag size={28} />
          </div>
          <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-black">
            Tu carrito está vacío
          </h2>
          <p className="text-xs text-neutral-600">
            No tienes productos seleccionados para iniciar el proceso de compra.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-brand-accent hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 pt-6">
      {/* Script oficial de Culqi Checkout v4 */}
      <Script src="https://checkout.culqi.com/js/v4" strategy="afterInteractive" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-6">
          <Link href="/cart" className="hover:text-brand-accent transition-colors flex items-center gap-1">
            <TbArrowLeft size={13} />
            Volver al Carrito
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Finalizar Compra Segura</span>
        </nav>

        <form onSubmit={handleProcessOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA: Formulario de Datos y Entrega */}
          <div className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-brand-accent rounded-none text-brand-accent text-xs font-bold flex items-center gap-2">
                <TbAlertCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Datos Personales y Comprobante */}
            <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#d9d9d9] pb-3">
                <TbUser className="text-brand-accent" size={20} />
                <h2 className="font-display font-extrabold uppercase tracking-tight text-black text-sm">
                  1. Datos del Comprador y Comprobante
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-12">
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    ¿Con qué documento deseas tu comprobante? *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.invoiceType}
                      onChange={(e) => handleInvoiceTypeChange(e.target.value as 'boleta' | 'factura')}
                      className="border border-[#d9d9d9] rounded-none p-2.5 bg-[#f8f8f8] text-xs font-bold text-black focus:border-black outline-none cursor-pointer shrink-0"
                    >
                      <option value="boleta">DNI (Boleta)</option>
                      <option value="factura">RUC (Factura)</option>
                    </select>

                    <input
                      type="text"
                      inputMode="numeric"
                      name="docNumber"
                      value={formData.docNumber}
                      onChange={handleInputChange}
                      maxLength={formData.invoiceType === 'factura' ? 11 : 8}
                      placeholder={
                        formData.invoiceType === 'factura'
                          ? 'Número de RUC (11 dígitos)'
                          : 'Número de DNI (8 dígitos)'
                      }
                      className="flex-1 min-w-0 border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none font-mono"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        void runDocumentLookup(
                          formData.invoiceType as 'boleta' | 'factura',
                          formData.docNumber,
                          true,
                        )
                      }
                      disabled={
                        isLookingUpDoc ||
                        formData.docNumber.length !==
                          (formData.invoiceType === 'factura' ? 11 : 8)
                      }
                      title="Consultar automáticamente en RENIEC / SUNAT"
                      className="px-3.5 py-2.5 bg-brand-primary hover:bg-brand-accent disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-[11px] font-bold uppercase tracking-wider rounded-none transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
                    >
                      {isLookingUpDoc ? (
                        <TbLoader2 size={15} className="animate-spin" />
                      ) : (
                        <TbSearch size={15} />
                      )}
                      <span className="hidden sm:inline">
                        {isLookingUpDoc ? 'Buscando...' : 'Buscar'}
                      </span>
                    </button>
                  </div>

                  {docLookupStatus && (
                    <p
                      className={`mt-1.5 text-[11px] font-medium flex items-center gap-1.5 ${
                        docLookupStatus.type === 'success'
                          ? 'text-[#2e9e7b]'
                          : 'text-amber-700'
                      }`}
                    >
                      {docLookupStatus.type === 'success' ? (
                        <TbCheck size={14} className="shrink-0" />
                      ) : (
                        <TbAlertCircle size={14} className="shrink-0" />
                      )}
                      <span>{docLookupStatus.text}</span>
                    </p>
                  )}
                </div>

                {formData.invoiceType === 'factura' && (
                  <div className="sm:col-span-12 animate-in fade-in">
                    <label className="flex items-center justify-between font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                      <span>Razón Social de la Empresa *</span>
                      {docLookupStatus?.type === 'success' && formData.companyLegalName.trim() && (
                        <span className="text-[10px] font-bold text-[#2e9e7b] normal-case tracking-normal inline-flex items-center gap-1">
                          <TbCheck size={12} /> Verificado SUNAT
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="companyLegalName"
                      value={formData.companyLegalName}
                      onChange={handleInputChange}
                      readOnly={
                        docLookupStatus?.type === 'success' &&
                        Boolean(formData.companyLegalName.trim())
                      }
                      placeholder="Ej: Inversiones y Servicios S.A.C."
                      className={`w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs outline-none ${
                        docLookupStatus?.type === 'success' &&
                        formData.companyLegalName.trim()
                          ? 'bg-neutral-100 text-neutral-700 cursor-not-allowed'
                          : 'bg-white focus:border-black'
                      }`}
                      required
                    />
                  </div>
                )}

                <div className="sm:col-span-12">
                  <label className="flex items-center justify-between font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    <span>
                      {formData.invoiceType === 'factura'
                        ? 'Persona de Contacto / Quien Recibe *'
                        : 'Nombres y Apellidos *'}
                    </span>
                    {formData.invoiceType === 'boleta' &&
                      docLookupStatus?.type === 'success' &&
                      formData.fullName.trim() && (
                        <span className="text-[10px] font-bold text-[#2e9e7b] normal-case tracking-normal inline-flex items-center gap-1">
                          <TbCheck size={12} /> Verificado RENIEC
                        </span>
                      )}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    readOnly={
                      formData.invoiceType === 'boleta' &&
                      docLookupStatus?.type === 'success' &&
                      Boolean(formData.fullName.trim())
                    }
                    placeholder={formData.invoiceType === 'factura' ? 'Persona responsable de recibir el pedido' : 'Juan Pérez'}
                    className={`w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs outline-none ${
                      formData.invoiceType === 'boleta' &&
                      docLookupStatus?.type === 'success' &&
                      formData.fullName.trim()
                        ? 'bg-neutral-100 text-neutral-700 cursor-not-allowed'
                        : 'bg-white focus:border-black'
                    }`}
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    Teléfono Móvil (9 dígitos) *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={9}
                    placeholder="Ej: 987654321"
                    className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Dirección de Entrega (Ubigeo Automático) */}
            <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#d9d9d9] pb-3">
                <TbMapPin className="text-brand-accent" size={20} />
                <h2 className="font-display font-extrabold uppercase tracking-tight text-black text-sm">
                  2. Dirección de Entrega y Delivery
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-4">
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    Departamento *
                  </label>
                  <select
                    name="department"
                    value={selectedDeptCode}
                    onChange={handleDepartmentChange}
                    className="w-full border border-[#d9d9d9] rounded-none p-2.5 bg-white text-xs focus:border-black outline-none cursor-pointer"
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
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    Provincia *
                  </label>
                  <select
                    name="province"
                    value={selectedProvCode}
                    onChange={handleProvinceChange}
                    disabled={!selectedDeptCode || loadingProvinces}
                    className="w-full border border-[#d9d9d9] rounded-none p-2.5 bg-white text-xs focus:border-black outline-none disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
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
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    Distrito *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvCode || loadingDistricts}
                    className="w-full border border-[#d9d9d9] rounded-none p-2.5 bg-white text-xs focus:border-black outline-none disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
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
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    Dirección Exacta (Calle, Jr, Av y N°) *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. Los Sauces 123 Dpto 401"
                    className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-[11px]">
                    Referencia
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    placeholder="Frente al parque"
                    className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Selección de Medio de Pago */}
            <div className="bg-white rounded-none border border-[#d9d9d9] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#d9d9d9] pb-3">
                <div className="flex items-center gap-2">
                  <TbCreditCard className="text-brand-accent" size={20} />
                  <h2 className="font-display font-extrabold uppercase tracking-tight text-black text-sm">
                    3. Método de Pago
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <FaCcVisa size={22} className="text-black" />
                  <FaCcMastercard size={22} className="text-brand-accent" />
                  <FaCcAmex size={22} className="text-neutral-700" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Opción 1: Tarjeta Débito / Crédito */}
                <label
                  className={`p-4 rounded-none border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    formData.paymentMethod === 'card'
                      ? 'border-black bg-[#f8f8f8]'
                      : 'border-[#d9d9d9] hover:border-black bg-white'
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center shrink-0">
                        <TbCreditCard size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-black text-sm uppercase">
                          Tarjeta Débito / Crédito
                        </div>
                        <div className="text-[11px] text-neutral-500">Visa, Mastercard, Amex, Diners</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#d9d9d9]">
                    <FaCcVisa size={24} className="text-black" />
                    <FaCcMastercard size={24} className="text-brand-accent" />
                    <FaCcAmex size={24} className="text-neutral-700" />
                    <span className="text-[10px] text-neutral-500 ml-auto font-bold uppercase">
                      Pago en cuotas
                    </span>
                  </div>
                </label>

                {/* Opción 2: Billeteras Digitales (Yape / Plin) */}
                <label
                  className={`p-4 rounded-none border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    formData.paymentMethod === 'yape'
                      ? 'border-black bg-[#f8f8f8]'
                      : 'border-[#d9d9d9] hover:border-black bg-white'
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none bg-brand-accent text-white flex items-center justify-center shrink-0">
                        <TbQrcode size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-black text-sm uppercase">
                          Billeteras Digitales
                        </div>
                        <div className="text-[11px] text-neutral-500">Yape / Plin con código QR</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2.5 border-t border-[#d9d9d9]">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-none bg-[#742284] text-white text-[11px] font-black tracking-wide">
                      yape
                    </span>
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-none bg-[#00d4aa] text-black text-[11px] font-black tracking-wide">
                      plin
                    </span>
                    <span className="text-[10px] text-neutral-500 ml-auto font-bold uppercase">
                      Al instante
                    </span>
                  </div>
                </label>
              </div>

              {/* Banner informativo de Culqi */}
              <div className="p-3.5 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] flex items-start gap-2.5 text-xs text-black">
                <TbShieldCheck size={20} className="text-[#2e9e7b] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-neutral-700">
                  Al presionar el botón <strong>&ldquo;Pagar con Culqi&rdquo;</strong>, se abrirá la pasarela oficial y protegida de <strong>Culqi</strong> para completar tu pago de forma 100% segura con encriptación bancaria PCI-DSS.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Resumen de Pedido y Botón Final */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-5 sm:p-6 space-y-4">
              <h2 className="font-display font-extrabold uppercase tracking-tight text-black text-sm border-b border-[#d9d9d9] pb-3">
                Resumen del Pedido ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
              </h2>

              {/* Lista de productos en resumen */}
              <div className="max-h-64 overflow-y-auto divide-y divide-[#d9d9d9] pr-1 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="pt-2.5 flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-none bg-white border border-[#d9d9d9] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-black font-bold truncate">{item.title}</p>
                      <p className="text-neutral-500 text-[11px]">Cant: {item.quantity}</p>
                    </div>
                    <div className="font-extrabold text-black shrink-0">
                      {currencySymbol} {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cálculos */}
              <div className="pt-3 border-t border-[#d9d9d9] space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-black">
                    {currencySymbol} {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span className="flex items-center gap-1">
                    <TbTruckDelivery size={15} className="text-[#2e9e7b]" />
                    <span>Costo de Delivery:</span>
                  </span>
                  <span className="font-bold text-black">
                    {isFreeShipping ? (
                      <span className="text-[#2e9e7b] font-bold uppercase">Gratis</span>
                    ) : (
                      `${currencySymbol} ${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#d9d9d9] flex justify-between items-baseline">
                  <span className="text-sm font-bold uppercase tracking-wider text-black">
                    Total a Pagar:
                  </span>
                  <span className="font-display text-2xl font-extrabold text-black">
                    {currencySymbol} {totalToPay.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botón de Confirmación y Pago */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-brand-accent hover:bg-red-700 disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <TbLoader2 className="animate-spin" size={18} />
                    <span>Procesando pago seguro...</span>
                  </>
                ) : formData.paymentMethod === 'transfer' ? (
                  <>
                    <TbCheck size={18} />
                    <span>Confirmar Pedido ({currencySymbol} {totalToPay.toFixed(2)})</span>
                  </>
                ) : (
                  <>
                    <TbLock size={18} />
                    <span>Pagar con Culqi ({currencySymbol} {totalToPay.toFixed(2)})</span>
                  </>
                )}
              </button>

              {/* Sellos de Seguridad */}
              <div className="pt-2 border-t border-[#d9d9d9] space-y-1.5 text-[11px] text-neutral-600">
                <div className="flex items-center gap-2 text-black font-medium">
                  <TbShieldCheck size={16} className="text-[#2e9e7b] shrink-0" />
                  <span>Compra 100% Protegida con garantía de entrega</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <TbLock size={14} className="shrink-0" />
                  <span>Transacción encriptada con cifrado SSL · Venta de vinos exclusiva +18</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
