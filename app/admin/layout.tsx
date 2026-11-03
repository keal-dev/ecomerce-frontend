import React from 'react';
import { Sidebar } from "@/app/admin/_components/Sidebar";
import { Header } from "@/app/admin/_components/Header";
import { AdminGuard } from "@/app/admin/_components/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        <Sidebar />
        <div className="flex flex-col min-w-0 lg:pl-56">
          <Header />
          <main className="flex-1 px-5 py-3 sm:px-7 sm:py-4">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
