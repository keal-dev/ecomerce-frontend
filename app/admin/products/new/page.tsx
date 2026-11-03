'use client';

import React from 'react';
import { ProductForm } from '../_components/ProductForm';
import { useProductStore } from '@/stores/product.store';
import { CreateProductDto } from '@/types/product.types';

export default function NewProductPage() {
  const { addProduct } = useProductStore();

  const handleCreate = async (data: CreateProductDto) => {
    await addProduct(data);
  };

  return <ProductForm onSubmit={handleCreate as any} isEditing={false} />;
}
