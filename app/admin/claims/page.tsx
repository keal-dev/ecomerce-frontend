import React from 'react';
import { ClaimsManager } from './_components/ClaimsManager';

export const metadata = {
  title: 'Libro de Reclamaciones | Panel Admin',
  description: 'Gestión y respuesta oficial de reclamos y quejas INDECOPI.',
};

export default function AdminClaimsPage() {
  return <ClaimsManager />;
}
