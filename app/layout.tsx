import type { Metadata } from "next";
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { UserSyncProvider } from "@/components/shared/UserSyncProvider";
import { BrandThemeProvider } from "@/components/shared/BrandThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cooperativa Gourmet — Vinos, Chocolates, Cacao y Café de Origen",
  description: "Vinos seleccionados, chocolates finos, derivados del cacao y café de especialidad directos de nuestra cooperativa con delivery y comprobante electrónico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${inter.variable} ${playfairDisplay.variable} ${plusJakartaSans.variable}`}>
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
