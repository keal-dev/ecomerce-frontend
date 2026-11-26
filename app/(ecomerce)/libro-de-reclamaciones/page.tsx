'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TbChevronRight,
  TbBook,
  TbPrinter,
  TbAlertCircle,
  TbArrowLeft,
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { getDepartments, getProvinces, getDistricts } from '@/services/ubigeo.service';
import { DepartmentItem, ProvinceItem, DistrictItem } from '@/types/ubigeo.types';
import { createClaim } from '@/services/claim.service';

interface ClaimFormData {
  isMinor: boolean;
  tutorName: string;
  tutorDocType: string;
  tutorDocNumber: string;
  tutorPhone: string;

  docType: string;
  docNumber: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  province: string;
  district: string;
  address: string;

  contractType: 'producto' | 'servicio';
  claimedAmount: string;
  orderNumber: string;
  contractDescription: string;

  claimType: 'reclamo' | 'queja';
  claimDetail: string;
  claimRequest: string;
  acceptedTerms: boolean;
}

export default function LibroDeReclamacionesPage() {
  const { company, fetchCompany } = useCompanyStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<{
    code: string;
    date: string;
    data: ClaimFormData;
  } | null>(null);

  const [formData, setFormData] = useState<ClaimFormData>({
    isMinor: false,
    tutorName: '',
    tutorDocType: 'DNI',
    tutorDocNumber: '',
    tutorPhone: '',

    docType: 'DNI',
    docNumber: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    province: '',
    district: '',
    address: '',

    contractType: 'producto',
    claimedAmount: '',
    orderNumber: '',
    contractDescription: '',

    claimType: 'reclamo',
    claimDetail: '',
    claimRequest: '',
    acceptedTerms: false,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const companyName = company?.name || 'Cooperativa Gourmet';
  const legalName = company?.legalName || 'Empresa Principal S.A.C.';
  const taxId = company?.taxId || 'RUC registrado';
  const fiscalAddress = company?.address || 'Lima, Perú';

  const handleDepartmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptCode = e.target.value;
    const selectedDept = departments.find((d) => d.departmentCode === deptCode);
    const deptName = selectedDept ? selectedDept.department : '';

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
    const selectedProv = provinces.find((p) => p.provinceCode === provCode);
    const provName = selectedProv ? selectedProv.province : '';

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
    setFormData((prev) => ({
      ...prev,
      district: distName,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.isMinor && (!formData.tutorName.trim() || !formData.tutorDocNumber.trim())) {
      setErrorMsg('Para menores de edad, debes completar los datos del padre, madre o tutor.');
      return;
    }
    if (!formData.fullName.trim() || !formData.docNumber.trim()) {
      setErrorMsg('Por favor completa los datos de identificación del consumidor (Nombre y Documento).');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('El correo electrónico es obligatorio para remitir la copia de la Hoja de Reclamación.');
      return;
    }
    if (!formData.department.trim() || !formData.province.trim() || !formData.district.trim()) {
      setErrorMsg('Por favor selecciona tu Departamento, Provincia y Distrito de residencia.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('La dirección domiciliaria es obligatoria.');
      return;
    }
    if (!formData.contractDescription.trim()) {
      setErrorMsg('Por favor describe el producto o servicio materia de la reclamación.');
      return;
    }
    if (!formData.claimDetail.trim() || !formData.claimRequest.trim()) {
      setErrorMsg('Debes ingresar el detalle de los hechos y tu pedido concreto.');
      return;
    }
    if (!formData.acceptedTerms) {
      setErrorMsg('Debes declarar que la información consignada es verdadera.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedAmount =
        formData.claimedAmount.trim() !== '' && !isNaN(Number(formData.claimedAmount))
          ? Number(formData.claimedAmount)
          : undefined;

      const created = await createClaim({
        isMinor: formData.isMinor,
        tutorName: formData.isMinor ? formData.tutorName.trim() : undefined,
        tutorDocType: formData.isMinor ? formData.tutorDocType : undefined,
        tutorDocNumber: formData.isMinor ? formData.tutorDocNumber.trim() : undefined,
        tutorPhone: formData.isMinor && formData.tutorPhone.trim() ? formData.tutorPhone.trim() : undefined,
        docType: formData.docType,
        docNumber: formData.docNumber.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        department: formData.department.trim(),
        province: formData.province.trim(),
        district: formData.district.trim(),
        address: formData.address.trim(),
        contractType: formData.contractType,
        claimedAmount: parsedAmount,
        orderNumber: formData.orderNumber.trim() || undefined,
        contractDescription: formData.contractDescription.trim(),
        claimType: formData.claimType,
        claimDetail: formData.claimDetail.trim(),
        claimRequest: formData.claimRequest.trim(),
      });

      const claimDate = new Date(created.createdAt || Date.now()).toLocaleString('es-PE', {
        dateStyle: 'long',
        timeStyle: 'medium',
      });

      setSubmittedClaim({
        code: created.code,
        date: claimDate,
        data: { ...formData },
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message;
      setErrorMsg(
        Array.isArray(apiMsg)
          ? apiMsg.join(' ')
          : apiMsg || 'No se pudo registrar la hoja de reclamación. Intenta nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  // VISTA DE CONSTANCIA FORMAL / HOJA DE RECLAMACIÓN GENERADA
  if (submittedClaim) {
    return (
      <div className="min-h-screen bg-white pb-16 pt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-4 print:hidden">
            <button
              type="button"
              onClick={() => setSubmittedClaim(null)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black font-bold uppercase tracking-wider cursor-pointer"
            >
              <TbArrowLeft size={16} />
              Volver al formulario
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <TbPrinter size={16} />
              Imprimir / Guardar Constancia en PDF
            </button>
          </div>

          {/* Formato Oficial Hoja de Reclamación INDECOPI */}
          <div className="bg-white rounded-none border-2 border-black p-6 sm:p-10 text-[#020202] space-y-6 print:border-none print:p-0">
            <div className="border-b-2 border-black pb-5 text-center">
              <span className="inline-block px-3 py-1 bg-[#2e9e7b] text-white rounded-none text-[11px] font-bold uppercase tracking-wider mb-2 print:hidden">
                Registro Exitoso conforme a INDECOPI
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
                Libro de Reclamaciones Virtual
              </h1>
              <p className="text-sm font-bold text-black mt-1 font-mono">
                Hoja de Reclamación N° {submittedClaim.code}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">Fecha y hora de registro: {submittedClaim.date}</p>
            </div>

            <div className="bg-[#f8f8f8] p-4 rounded-none border border-[#d9d9d9] text-xs space-y-1">
              <p className="font-bold text-black uppercase text-[11px] tracking-wider">
                Datos del Proveedor (Comercio):
              </p>
              <p><strong>Razón Social:</strong> {legalName}</p>
              <p><strong>RUC:</strong> {taxId} | <strong>Nombre Comercial:</strong> {companyName}</p>
              <p><strong>Domicilio Fiscal:</strong> {fiscalAddress}</p>
            </div>

            <div className="space-y-2 text-xs">
              <h2 className="font-display font-bold text-black uppercase text-xs border-b border-black pb-1">
                1. Identificación del Consumidor Reclamante
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-800">
                <p><strong>Nombre / Razón Social:</strong> {submittedClaim.data.fullName}</p>
                <p><strong>Documento:</strong> {submittedClaim.data.docType} {submittedClaim.data.docNumber}</p>
                <p><strong>Teléfono / Celular:</strong> {submittedClaim.data.phone || 'No especificado'}</p>
                <p><strong>Correo Electrónico:</strong> {submittedClaim.data.email}</p>
                <p className="sm:col-span-2">
                  <strong>Domicilio:</strong> {submittedClaim.data.address}, {submittedClaim.data.district}, {submittedClaim.data.province}, {submittedClaim.data.department}
                </p>
                {submittedClaim.data.isMinor && (
                  <p className="sm:col-span-2 text-black bg-[#f3ff34]/40 border border-black p-2">
                    <strong>Padre/Madre/Tutor:</strong> {submittedClaim.data.tutorName} ({submittedClaim.data.tutorDocType} {submittedClaim.data.tutorDocNumber}) - Tel: {submittedClaim.data.tutorPhone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h2 className="font-display font-bold text-black uppercase text-xs border-b border-black pb-1">
                2. Identificación del Bien Contratado
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-800">
                <p><strong>Tipo de Bien:</strong> {submittedClaim.data.contractType === 'producto' ? 'Producto' : 'Servicio'}</p>
                <p><strong>Monto Reclamado:</strong> {submittedClaim.data.claimedAmount ? `S/ ${submittedClaim.data.claimedAmount}` : 'No consignado'}</p>
                {submittedClaim.data.orderNumber && (
                  <p><strong>N° de Pedido / Comprobante:</strong> {submittedClaim.data.orderNumber}</p>
                )}
                <p className="sm:col-span-2">
                  <strong>Descripción del Bien:</strong> {submittedClaim.data.contractDescription}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h2 className="font-display font-bold text-black uppercase text-xs border-b border-black pb-1">
                3. Detalle de la Reclamación y Pedido del Consumidor
              </h2>
              <div className="p-3 bg-[#f8f8f8] rounded-none border border-[#d9d9d9]">
                <p className="font-bold text-black uppercase text-[11px]">
                  Tipo de Reclamación: <span className="text-brand-accent">{submittedClaim.data.claimType.toUpperCase()}</span>
                </p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  {submittedClaim.data.claimType === 'reclamo'
                    ? 'Disconformidad relacionada a los productos o servicios adquiridos.'
                    : 'Malestar o descontento respecto a la atención al cliente.'}
                </p>
              </div>

              <div>
                <p className="font-bold text-black">Detalle de los hechos:</p>
                <p className="mt-1 p-3 bg-[#f8f8f8] border border-[#d9d9d9] rounded-none text-neutral-800 whitespace-pre-wrap">
                  {submittedClaim.data.claimDetail}
                </p>
              </div>

              <div>
                <p className="font-bold text-black">Pedido concreto del consumidor:</p>
                <p className="mt-1 p-3 bg-[#f8f8f8] border border-[#d9d9d9] rounded-none text-neutral-800 whitespace-pre-wrap">
                  {submittedClaim.data.claimRequest}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#d9d9d9] text-[11px] text-neutral-600 space-y-1.5 leading-relaxed bg-[#f8f8f8] p-4 rounded-none">
              <p>
                * <strong>Plazo de respuesta:</strong> Conforme a la <strong>Ley N° 31435</strong> que modifica el Código de Protección y Defensa del Consumidor, el proveedor deberá dar respuesta al reclamo o queja en un <strong>plazo no mayor a quince (15) días hábiles improrrogables</strong>, al correo electrónico consignado.
              </p>
              <p>
                * La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el <strong>INDECOPI</strong>.
              </p>
              <p>
                * Una copia de esta Hoja de Reclamación ha quedado debidamente asentada en nuestros registros informáticos.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VISTA DEL FORMULARIO OFICIAL
  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neutral-500 mb-5">
          <Link href="/" className="hover:text-brand-accent transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-neutral-400" />
          <span className="text-black font-bold">Libro de Reclamaciones</span>
        </nav>

        {/* Banner Superior Oficial */}
        <div className="bg-black text-white rounded-none border-b-4 border-brand-accent p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-accent text-white rounded-none shrink-0">
              <TbBook size={30} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent">
                Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571)
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">
                Libro de Reclamaciones Virtual
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1.5">
                Plataforma oficial integrada para registrar tu Queja o Reclamo conforme a los lineamientos de INDECOPI.
              </p>
            </div>
          </div>
        </div>

        {/* Ficha Informativa del Proveedor */}
        <div className="bg-[#f8f8f8] rounded-none border border-[#d9d9d9] p-5 mb-6 text-xs text-neutral-600 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider block">
              Razón Social:
            </span>
            <span className="font-bold text-black">{legalName}</span>
          </div>
          <div>
            <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider block">
              RUC / Identificación:
            </span>
            <span className="font-bold text-black">{taxId}</span>
          </div>
          <div>
            <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider block">
              Dirección Fiscal:
            </span>
            <span className="font-bold text-black">{fiscalAddress}</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-none border border-[#d9d9d9] p-6 sm:p-10 space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-brand-accent rounded-none text-brand-accent text-xs font-bold flex items-center gap-2">
              <TbAlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECCIÓN 1: Identificación del Consumidor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#d9d9d9] pb-2.5">
              <div className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="font-display font-extrabold text-black text-sm uppercase tracking-tight">
                Identificación del Consumidor Reclamante
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-4">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Tipo de Documento *
                </label>
                <select
                  name="docType"
                  value={formData.docType}
                  onChange={handleChange}
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 bg-white text-xs focus:border-black outline-none"
                >
                  <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                  <option value="CE">Carné de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div className="sm:col-span-8">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="docNumber"
                  value={formData.docNumber}
                  onChange={handleChange}
                  placeholder="Ingresa tu número de documento"
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Nombres y Apellidos Completos *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos Pérez Gómez"
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Correo Electrónico (Para envío de respuesta) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Teléfono / Celular *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="987654321"
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Departamento *
                </label>
                <select
                  name="department"
                  value={selectedDeptCode}
                  onChange={handleDepartmentChange}
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 bg-white text-xs focus:border-black outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Elige Departamento --</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentCode} value={dept.departmentCode}>
                      {dept.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Provincia *
                </label>
                <select
                  name="province"
                  value={selectedProvCode}
                  onChange={handleProvinceChange}
                  disabled={!selectedDeptCode || loadingProvinces}
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 bg-white text-xs focus:border-black outline-none disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
                  required
                >
                  <option value="">
                    {loadingProvinces
                      ? 'Cargando provincias...'
                      : !selectedDeptCode
                        ? 'Primero elige departamento'
                        : '-- Elige Provincia --'}
                  </option>
                  {provinces.map((prov) => (
                    <option key={prov.provinceCode} value={prov.provinceCode}>
                      {prov.province}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Distrito *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleDistrictChange}
                  disabled={!selectedProvCode || loadingDistricts}
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 bg-white text-xs focus:border-black outline-none disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
                  required
                >
                  <option value="">
                    {loadingDistricts
                      ? 'Cargando distritos...'
                      : !selectedProvCode
                        ? 'Primero elige provincia'
                        : '-- Elige Distrito --'}
                  </option>
                  {districts.map((dist) => (
                    <option key={dist.code} value={dist.district}>
                      {dist.district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-12">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Dirección Domiciliaria *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Av. / Calle / Jr. y número interior o referencia"
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                  required
                />
              </div>

              {/* Checkbox Menor de Edad */}
              <div className="sm:col-span-12 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    name="isMinor"
                    checked={formData.isMinor}
                    onChange={handleChange}
                    className="rounded-none border-[#d9d9d9] accent-brand-accent"
                  />
                  <span>
                    El reclamante es <strong>menor de edad</strong> (Habilitar datos del padre, madre o apoderado legal)
                  </span>
                </label>
              </div>

              {formData.isMinor && (
                <div className="sm:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#f8f8f8] rounded-none border border-[#d9d9d9] animate-in fade-in">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1 text-[11px]">
                      Nombre del Padre/Tutor *
                    </label>
                    <input
                      type="text"
                      name="tutorName"
                      value={formData.tutorName}
                      onChange={handleChange}
                      placeholder="Nombre completo del apoderado"
                      className="w-full border border-[#d9d9d9] rounded-none p-2 text-xs bg-white focus:border-black outline-none"
                      required={formData.isMinor}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1 text-[11px]">
                      DNI / Doc Apoderado *
                    </label>
                    <input
                      type="text"
                      name="tutorDocNumber"
                      value={formData.tutorDocNumber}
                      onChange={handleChange}
                      placeholder="N° de documento"
                      className="w-full border border-[#d9d9d9] rounded-none p-2 text-xs bg-white focus:border-black outline-none"
                      required={formData.isMinor}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1 text-[11px]">
                      Teléfono Apoderado *
                    </label>
                    <input
                      type="tel"
                      name="tutorPhone"
                      value={formData.tutorPhone}
                      onChange={handleChange}
                      placeholder="Celular"
                      className="w-full border border-[#d9d9d9] rounded-none p-2 text-xs bg-white focus:border-black outline-none"
                      required={formData.isMinor}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: Identificación del Bien Contratado */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#d9d9d9] pb-2.5">
              <div className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="font-display font-extrabold text-black text-sm uppercase tracking-tight">
                Identificación del Bien Contratado
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-4">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Tipo de Bien *
                </label>
                <div className="flex items-center gap-4 pt-1.5">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="contractType"
                      value="producto"
                      checked={formData.contractType === 'producto'}
                      onChange={handleChange}
                      className="accent-brand-accent"
                    />
                    <span>Producto</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="contractType"
                      value="servicio"
                      checked={formData.contractType === 'servicio'}
                      onChange={handleChange}
                      className="accent-brand-accent"
                    />
                    <span>Servicio</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Monto Reclamado (S/) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="claimedAmount"
                  value={formData.claimedAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  N° de Pedido / Boleta (Opcional)
                </label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  placeholder="Ej: ORD-2026-1024"
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Descripción del Producto o Servicio *
                </label>
                <input
                  type="text"
                  name="contractDescription"
                  value={formData.contractDescription}
                  onChange={handleChange}
                  placeholder="Ej: Vino Tinto Reserva + Caja de Chocolates de Cacao 70% + Café de Origen"
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Detalle de la Reclamación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#d9d9d9] pb-2.5">
              <div className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="font-display font-extrabold text-black text-sm uppercase tracking-tight">
                Detalle de la Reclamación
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold uppercase tracking-wider text-neutral-700 text-[11px]">
                Selecciona el tipo de reclamación (Definiciones INDECOPI) *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-none border-2 cursor-pointer transition-all ${
                    formData.claimType === 'reclamo'
                      ? 'border-black bg-[#f8f8f8]'
                      : 'border-[#d9d9d9] hover:border-black'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="claimType"
                      value="reclamo"
                      checked={formData.claimType === 'reclamo'}
                      onChange={handleChange}
                      className="mt-0.5 accent-brand-accent"
                    />
                    <div>
                      <span className="font-display font-extrabold uppercase text-black block">
                        RECLAMO
                      </span>
                      <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                        Disconformidad relacionada directamente a los productos o servicios adquiridos.
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-none border-2 cursor-pointer transition-all ${
                    formData.claimType === 'queja'
                      ? 'border-black bg-[#f8f8f8]'
                      : 'border-[#d9d9d9] hover:border-black'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="claimType"
                      value="queja"
                      checked={formData.claimType === 'queja'}
                      onChange={handleChange}
                      className="mt-0.5 accent-brand-accent"
                    />
                    <div>
                      <span className="font-display font-extrabold uppercase text-black block">
                        QUEJA
                      </span>
                      <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                        Malestar o descontento respecto a la atención al público brindada por el personal.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Detalle de los hechos (Explica con claridad lo sucedido) *
                </label>
                <textarea
                  name="claimDetail"
                  rows={4}
                  value={formData.claimDetail}
                  onChange={handleChange}
                  placeholder="Describe cronológicamente lo acontecido con el producto, servicio o atención recibida..."
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Pedido Concreto del Consumidor (Qué solución solicitas) *
                </label>
                <textarea
                  name="claimRequest"
                  rows={3}
                  value={formData.claimRequest}
                  onChange={handleChange}
                  placeholder="Indica qué solicitas: Ej: Reposición del producto, reembolso del dinero, etc."
                  className="w-full border border-[#d9d9d9] rounded-none p-2.5 text-xs focus:border-black outline-none leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Declaración Jurada y Advertencias Legales */}
          <div className="pt-2 border-t border-[#d9d9d9] space-y-3 text-[11px] text-neutral-600 leading-relaxed">
            <label className="inline-flex items-start gap-2 cursor-pointer text-black">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                className="rounded-none border-[#d9d9d9] accent-brand-accent mt-0.5"
                required
              />
              <span className="font-semibold">
                Declaro bajo juramento que toda la información consignada en esta Hoja de Reclamación es verdadera y autorizo la notificación de la respuesta al correo electrónico indicado.
              </span>
            </label>

            <div className="bg-[#f8f8f8] p-3.5 rounded-none border border-[#d9d9d9] space-y-1 text-neutral-600">
              <p>
                * <strong>Plazo legal de respuesta:</strong> Conforme a la <strong>Ley N° 31435</strong>, el proveedor deberá dar respuesta al reclamo en un <strong>plazo no mayor a quince (15) días hábiles improrrogables</strong>.
              </p>
              <p>
                * La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el <strong>INDECOPI</strong>.
              </p>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#d9d9d9]">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-none border border-black text-black hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-accent hover:bg-red-700 disabled:bg-neutral-300 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Registrando en Libro...' : 'Enviar Hoja de Reclamación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
