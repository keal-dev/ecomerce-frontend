import { Metadata } from 'next';
import { BannersManager } from './_components/BannersManager';

export const metadata: Metadata = {
  title: 'Banners y Marketing | Panel de Administración',
  description: 'Gestión de banners, carrusel principal y campañas publicitarias.',
};

export default function AdminMarketingPage() {
  return <BannersManager />;
}
