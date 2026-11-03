import React from 'react';
import { Navbar } from './_components/Navbar';
import { Footer } from './_components/Footer';

export default function EcomerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col justify-between">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
