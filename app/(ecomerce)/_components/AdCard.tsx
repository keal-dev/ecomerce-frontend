import React from 'react';
import Link from 'next/link';
import { TbExternalLink, TbSparkles } from 'react-icons/tb';

export interface AdCardProps {
  tag?: string;
  brand?: string;
  title: string;
  description: string;
  ctaText?: string;
  href?: string;
  imageUrl: string;
  badge?: string;
}

export const AdCard = ({
  tag = "Publicidad",
  brand = "Samsung Galaxy",
  title = "Nuevo Galaxy S24 Ultra",
  description = "Hasta 18 cuotas sin interés y envío gratis a todo el país.",
  ctaText = "Ver oferta",
  href = "#",
  imageUrl = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
  badge = "Lanzamiento"
}: AdCardProps) => {
  return (
    <div className="col-span-2 sm:col-span-3 md:col-span-2 bg-white rounded shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden relative group flex flex-col justify-between">
      {/* Top Bar: Badge and Sponsored Tag */}
      <div className="p-4 pb-2 flex items-center justify-between z-10">
        {badge ? (
          <span className="bg-brand text-[#333] font-semibold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <TbSparkles size={12} className="text-gray-800" /> {badge}
          </span>
        ) : <div />}
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
          {tag}
        </span>
      </div>

      {/* Main Content & Product Showcase */}
      <div className="p-4 pt-1 flex flex-col md:flex-row items-center gap-4 flex-1">
        {/* Text details */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-xs uppercase font-semibold text-[#3483fa] tracking-wider mb-1">
            {brand}
          </span>
          <h3 className="text-xl font-bold text-[#333] tracking-tight leading-snug mb-2 group-hover:text-[#3483fa] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {description}
          </p>

          <div>
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 bg-[#3483fa] hover:bg-blue-600 text-white font-medium text-xs py-2 px-4 rounded shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>{ctaText}</span>
              <TbExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Product image */}
        <div className="w-full md:w-44 h-40 md:h-44 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
      </div>
    </div>
  );
};
