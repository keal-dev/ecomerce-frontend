import React from 'react';
import { Sidebar } from "@/app/admin/_components/Sidebar";
import { Header } from "@/app/admin/_components/Header";
import { AdminGuard } from "@/app/admin/_components/AdminGuard";
import './fluent-admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="admin-fluent min-h-screen bg-[#ebebeb] text-[#242424] font-store">
        <Sidebar />
        <div className="flex flex-col min-w-0 lg:pl-[225px]">
          <Header />
          <main className="flex-1 px-5 py-3 sm:px-7 sm:py-4">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
