'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '../../_components/ProductForm';
import { useProductStore } from '@/stores/product.store';
import { getProductById } from '@/services/product.service';
import { Product, UpdateProductDto } from '@/types/product.types';
import { TbLoader2 } from 'react-icons/tb';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { editProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al cargar el producto';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async (data: UpdateProductDto) => {
    if (!id) return;
    await editProduct(id, data);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 text-gray-500">
        <TbLoader2 size={32} className="animate-spin text-[#3483fa]" />
        <p className="text-sm font-medium">Cargando datos del producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <p className="text-sm font-semibold text-rose-600">
          {error || 'No se encontró el producto solicitado.'}
        </p>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="text-xs text-[#3483fa] hover:underline font-semibold"
        >
          Volver a la lista de productos
        </button>
      </div>
    );
  }

  return (
    <ProductForm
      initialData={product}
      onSubmit={handleUpdate as any}
      isEditing={true}
    />
  );
}
