import React from 'react';
import { Navbar } from './_components/Navbar';
import { Footer } from './_components/Footer';
import { MiniCartDrawer } from './_components/MiniCartDrawer';

export default function EcomerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#020202] font-store flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MiniCartDrawer />
    </div>
  );
}
