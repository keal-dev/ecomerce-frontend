import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { UserSyncProvider } from "@/components/shared/UserSyncProvider";
import { BrandThemeProvider } from "@/components/shared/BrandThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MercadoFalso — Tu tienda online",
  description: "Compra productos con ofertas, envíos rápidos y pagos seguros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${inter.variable}`}>
        <body className="min-h-screen font-sans antialiased">
          <UserSyncProvider>
            <BrandThemeProvider>
              {children}
            </BrandThemeProvider>
          </UserSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
