import React from 'react';
import { BrandsManager } from './_components/BrandsManager';

export const metadata = {
  title: 'Marcas y Fabricantes | Panel Admin',
  description: 'Gestión de marcas, fabricantes y logotipos oficiales de productos.',
};

export default function BrandsPage() {
  return <BrandsManager />;
}
