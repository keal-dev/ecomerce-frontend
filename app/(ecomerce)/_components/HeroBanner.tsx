import React from 'react';

export const HeroBanner = () => {
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 h-[340px] relative -z-10 shadow-inner">
      <div className="max-w-[1200px] mx-auto h-full flex items-center px-4">
        <div className="text-white">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-md">Aprovecha el Hot Sale</h1>
          <p className="text-2xl drop-shadow-md mb-6">Hasta 50% OFF y 12 cuotas sin interés</p>
          <button className="bg-white text-blue-600 font-semibold py-2 px-6 rounded shadow hover:bg-gray-50 transition-colors">
            Ver ofertas
          </button>
        </div>
      </div>
      {/* Fade to background color to blend with the #ebebeb background below */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#ebebeb] to-transparent"></div>
    </div>
  );
};
