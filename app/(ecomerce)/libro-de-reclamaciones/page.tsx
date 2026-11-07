'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TbChevronRight, 
  TbBook, 
  TbFileCheck, 
  TbPrinter, 
  TbBuildingStore, 
  TbUser, 
  TbShoppingBag, 
  TbAlertCircle, 
  TbCheck, 
  TbArrowLeft,
  TbHelpCircle
} from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { getDepartments, getProvinces, getDistricts } from '@/services/ubigeo.service';
import { DepartmentItem, ProvinceItem, DistrictItem } from '@/types/ubigeo.types';

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

  // Estados para Ubigeo Dinámico
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

  const companyName = company?.name || 'MercadoAdmin';
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validaciones indispensables de INDECOPI
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

    // Generar correlativo formal: LR-[AÑO]-[NÚMERO RANDOM ÚNICO]
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const claimCode = `LR-${year}-${randomNum}`;
    const claimDate = new Date().toLocaleString('es-PE', {
      dateStyle: 'long',
      timeStyle: 'medium',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedClaim({
        code: claimCode,
        date: claimDate,
        data: { ...formData },
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  if (!mounted) return null;

  // VISTA DE CONSTANCIA FORMAL / HOJA DE RECLAMACIÓN GENERADA
  if (submittedClaim) {
    return (
      <div className="min-h-screen pb-16 pt-5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-4 print:hidden">
            <button
              onClick={() => setSubmittedClaim(null)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"
            >
              <TbArrowLeft size={16} />
              Volver al formulario
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3483fa] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <TbPrinter size={16} />
              Imprimir / Guardar Constancia en PDF
            </button>
          </div>

          {/* Formato Oficial Hoja de Reclamación INDECOPI */}
          <div className="bg-white rounded-2xl border border-gray-300 p-6 sm:p-10 shadow-sm text-gray-800 space-y-6 print:shadow-none print:border-none print:p-0">
            {/* Cabecera Oficial */}
            <div className="border-b-2 border-gray-900 pb-5 text-center">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 print:hidden">
                Registro Exitoso conforme a INDECOPI
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">
                Libro de Reclamaciones Virtual
              </h1>
              <p className="text-sm font-bold text-gray-700 mt-1">
                Hoja de Reclamación N° {submittedClaim.code}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Fecha y hora de registro: {submittedClaim.date}</p>
            </div>

            {/* Datos del Proveedor */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 text-xs space-y-1">
              <p className="font-bold text-gray-900 uppercase text-[11px] tracking-wider">
                Datos del Proveedor (Comercio):
              </p>
              <p><strong>Razón Social:</strong> {legalName}</p>
              <p><strong>RUC:</strong> {taxId} | <strong>Nombre Comercial:</strong> {companyName}</p>
              <p><strong>Domicilio Fiscal:</strong> {fiscalAddress}</p>
            </div>

            {/* Bloque 1: Consumidor */}
            <div className="space-y-2 text-xs">
              <h2 className="font-bold text-gray-900 uppercase text-xs border-b pb-1">
                1. Identificación del Consumidor Reclamante
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                <p><strong>Nombre / Razón Social:</strong> {submittedClaim.data.fullName}</p>
                <p><strong>Documento:</strong> {submittedClaim.data.docType} {submittedClaim.data.docNumber}</p>
                <p><strong>Teléfono / Celular:</strong> {submittedClaim.data.phone || 'No especificado'}</p>
                <p><strong>Correo Electrónico:</strong> {submittedClaim.data.email}</p>
                <p className="sm:col-span-2">
                  <strong>Domicilio:</strong> {submittedClaim.data.address}, {submittedClaim.data.district}, {submittedClaim.data.province}, {submittedClaim.data.department}
                </p>
                {submittedClaim.data.isMinor && (
                  <p className="sm:col-span-2 text-amber-800 bg-amber-50 p-2 rounded">
                    <strong>Padre/Madre/Tutor:</strong> {submittedClaim.data.tutorName} ({submittedClaim.data.tutorDocType} {submittedClaim.data.tutorDocNumber}) - Tel: {submittedClaim.data.tutorPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Bloque 2: Bien Contratado */}
            <div className="space-y-2 text-xs">
              <h2 className="font-bold text-gray-900 uppercase text-xs border-b pb-1">
                2. Identificación del Bien Contratado
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
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

            {/* Bloque 3: Detalle de la Reclamación */}
            <div className="space-y-3 text-xs">
              <h2 className="font-bold text-gray-900 uppercase text-xs border-b pb-1">
                3. Detalle de la Reclamación y Pedido del Consumidor
              </h2>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-900 uppercase text-[11px]">
                  Tipo de Reclamación: <span className="text-[#3483fa]">{submittedClaim.data.claimType.toUpperCase()}</span>
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {submittedClaim.data.claimType === 'reclamo' 
                    ? 'Disconformidad relacionada a los productos o servicios adquiridos.' 
                    : 'Malestar o descontento respecto a la atención al cliente.'}
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-800">Detalle de los hechos:</p>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {submittedClaim.data.claimDetail}
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-800">Pedido concreto del consumidor:</p>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {submittedClaim.data.claimRequest}
                </p>
              </div>
            </div>

            {/* Notas Legales INDECOPI */}
            <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-500 space-y-1.5 leading-relaxed bg-blue-50/50 p-4 rounded-xl">
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
    <div className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Libro de Reclamaciones</span>
        </nav>

        {/* Banner Superior Oficial */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand/30 text-gray-900 rounded-xl shrink-0">
              <TbBook size={32} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3483fa]">
                Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571)
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                Libro de Reclamaciones Virtual
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                Plataforma oficial integrada para registrar tu Queja o Reclamo conforme a los lineamientos de INDECOPI.
              </p>
            </div>
          </div>
        </div>

        {/* Ficha Informativa del Proveedor */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 mb-6 shadow-xs text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-gray-400 font-medium block">Razón Social:</span>
            <span className="font-bold text-gray-900">{legalName}</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">RUC / Identificación:</span>
            <span className="font-bold text-gray-900">{taxId}</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">Dirección Fiscal:</span>
            <span className="font-bold text-gray-900">{fiscalAddress}</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-8">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <TbAlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECCIÓN 1: Identificación del Consumidor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs font-bold">1</div>
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                Identificación del Consumidor Reclamante
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-4">
                <label className="block font-medium text-gray-700 mb-1">Tipo de Documento *</label>
                <select
                  name="docType"
                  value={formData.docType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                >
                  <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                  <option value="CE">Carné de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div className="sm:col-span-8">
                <label className="block font-medium text-gray-700 mb-1">Número de Documento *</label>
                <input
                  type="text"
                  name="docNumber"
                  value={formData.docNumber}
                  onChange={handleChange}
                  placeholder="Ingresa tu número de documento"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block font-medium text-gray-700 mb-1">Nombres y Apellidos Completos *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos Pérez Gómez"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block font-medium text-gray-700 mb-1">Correo Electrónico (Para envío de respuesta) *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block font-medium text-gray-700 mb-1">Teléfono / Celular *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="987654321"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block font-medium text-gray-700 mb-1">Departamento *</label>
                <select
                  name="department"
                  value={selectedDeptCode}
                  onChange={handleDepartmentChange}
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden cursor-pointer"
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
                <label className="block font-medium text-gray-700 mb-1">Provincia *</label>
                <select
                  name="province"
                  value={selectedProvCode}
                  onChange={handleProvinceChange}
                  disabled={!selectedDeptCode || loadingProvinces}
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
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
                <label className="block font-medium text-gray-700 mb-1">Distrito *</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleDistrictChange}
                  disabled={!selectedProvCode || loadingDistricts}
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
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
                <label className="block font-medium text-gray-700 mb-1">Dirección Domiciliaria *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Av. / Calle / Jr. y número interior o referencia"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                  required
                />
              </div>

              {/* Checkbox Menor de Edad */}
              <div className="sm:col-span-12 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    name="isMinor"
                    checked={formData.isMinor}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-[#3483fa] focus:ring-[#3483fa]"
                  />
                  <span>El reclamante es <strong>menor de edad</strong> (Habilitar datos del padre, madre o apoderado legal)</span>
                </label>
              </div>

              {formData.isMinor && (
                <div className="sm:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Nombre del Padre/Tutor *</label>
                    <input
                      type="text"
                      name="tutorName"
                      value={formData.tutorName}
                      onChange={handleChange}
                      placeholder="Nombre completo del apoderado"
                      className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white"
                      required={formData.isMinor}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">DNI / Doc Apoderado *</label>
                    <input
                      type="text"
                      name="tutorDocNumber"
                      value={formData.tutorDocNumber}
                      onChange={handleChange}
                      placeholder="N° de documento"
                      className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white"
                      required={formData.isMinor}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Teléfono Apoderado *</label>
                    <input
                      type="tel"
                      name="tutorPhone"
                      value={formData.tutorPhone}
                      onChange={handleChange}
                      placeholder="Celular"
                      className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white"
                      required={formData.isMinor}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: Identificación del Bien Contratado */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs font-bold">2</div>
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                Identificación del Bien Contratado
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-4">
                <label className="block font-medium text-gray-700 mb-1">Tipo de Bien *</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contractType"
                      value="producto"
                      checked={formData.contractType === 'producto'}
                      onChange={handleChange}
                      className="text-[#3483fa] focus:ring-[#3483fa]"
                    />
                    <span>Producto</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contractType"
                      value="servicio"
                      checked={formData.contractType === 'servicio'}
                      onChange={handleChange}
                      className="text-[#3483fa] focus:ring-[#3483fa]"
                    />
                    <span>Servicio</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block font-medium text-gray-700 mb-1">Monto Reclamado (S/) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="claimedAmount"
                  value={formData.claimedAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block font-medium text-gray-700 mb-1">N° de Pedido / Boleta (Opcional)</label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  placeholder="Ej: ORD-1024"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block font-medium text-gray-700 mb-1">Descripción del Producto o Servicio *</label>
                <input
                  type="text"
                  name="contractDescription"
                  value={formData.contractDescription}
                  onChange={handleChange}
                  placeholder="Ej: Smartphone Samsung Galaxy S23 128GB adquirido en la tienda online"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Detalle de la Reclamación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-[#3483fa] flex items-center justify-center text-xs font-bold">3</div>
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                Detalle de la Reclamación
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-medium text-gray-700">Selecciona el tipo de reclamación (Definiciones INDECOPI) *</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.claimType === 'reclamo'
                      ? 'border-[#3483fa] bg-blue-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="claimType"
                      value="reclamo"
                      checked={formData.claimType === 'reclamo'}
                      onChange={handleChange}
                      className="mt-0.5 text-[#3483fa]"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">RECLAMO</span>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Disconformidad relacionada directamente a los productos o servicios adquiridos.
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.claimType === 'queja'
                      ? 'border-[#3483fa] bg-blue-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="claimType"
                      value="queja"
                      checked={formData.claimType === 'queja'}
                      onChange={handleChange}
                      className="mt-0.5 text-[#3483fa]"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">QUEJA</span>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Malestar o descontento respecto a la atención al público brindada por el personal.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Detalle de los hechos (Explica con claridad lo sucedido) *</label>
                <textarea
                  name="claimDetail"
                  rows={4}
                  value={formData.claimDetail}
                  onChange={handleChange}
                  placeholder="Describe cronológicamente lo acontecido con el producto, servicio o atención recibida..."
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Pedido Concreto del Consumidor (Qué solución solicitas) *</label>
                <textarea
                  name="claimRequest"
                  rows={3}
                  value={formData.claimRequest}
                  onChange={handleChange}
                  placeholder="Indica qué solicitas: Ej: Cambio del equipo por uno nuevo, reembolso del dinero, etc."
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3483fa]/20 focus:border-[#3483fa] outline-hidden leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Declaración Jurada y Advertencias Legales */}
          <div className="pt-2 border-t border-gray-100 space-y-3 text-[11px] text-gray-500 leading-relaxed">
            <label className="inline-flex items-start gap-2 cursor-pointer text-gray-800">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                className="rounded border-gray-300 text-[#3483fa] focus:ring-[#3483fa] mt-0.5"
                required
              />
              <span className="font-medium">
                Declaro bajo juramento que toda la información consignada en esta Hoja de Reclamación es verdadera y autorizo la notificación de la respuesta al correo electrónico indicado.
              </span>
            </label>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-1 text-gray-500">
              <p>
                * <strong>Plazo legal de respuesta:</strong> Conforme a la <strong>Ley N° 31435</strong>, el proveedor deberá dar respuesta al reclamo en un <strong>plazo no mayor a quince (15) días hábiles improrrogables</strong>.
              </p>
              <p>
                * La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el <strong>INDECOPI</strong>.
              </p>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#3483fa] hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Registrando en Libro...' : 'Enviar Hoja de Reclamación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

