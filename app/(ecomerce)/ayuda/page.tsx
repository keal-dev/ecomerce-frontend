'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TbChevronRight } from 'react-icons/tb';
import { useCompanyStore } from '@/stores/company.store';
import { HelpHeader } from './_components/HelpHeader';
import { HelpCategoryCards, HelpCategoryType } from './_components/HelpCategoryCards';
import { HelpFaqAccordion } from './_components/HelpFaqAccordion';
import { HelpContactChannels } from './_components/HelpContactChannels';

export default function AyudaPage() {
  const { company, fetchCompany } = useCompanyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategoryType>('all');

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const scrollToFaq = () => {
    setTimeout(() => {
      const el = document.getElementById('faq-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSelectQuickTag = (tag: string) => {
    setSearchQuery(tag);
    setSelectedCategory('all');
    scrollToFaq();
  };

  const handleSearchSubmit = () => {
    scrollToFaq();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCategorySelect = (cat: HelpCategoryType) => {
    setSelectedCategory(cat);
    scrollToFaq();
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-light">
          <Link href="/" className="hover:text-[#3483fa] transition-colors">
            Inicio
          </Link>
          <TbChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Ayuda</span>
        </nav>

        {/* Banner principal con buscador */}
        <HelpHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectQuickTag={handleSelectQuickTag}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Tarjetas de temas frecuentes */}
        <HelpCategoryCards
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Preguntas frecuentes interactivas */}
        <HelpFaqAccordion
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
        />

        {/* Canales de contacto directo y formulario */}
        <HelpContactChannels company={company} />
      </div>
    </div>
  );
}
