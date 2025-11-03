import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { HydrationProvider } from "@/components/providers/HydrationProvider";

import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Developer Toolbox - 20+ Tools for Developers",
  description: "All-in-one platform with 20+ developer tools including JWT decoder, CSV to JSON, QR generator, image converter, and more.",
  keywords: ["developer tools", "jwt decoder", "csv json", "qr code", "image converter", "base64", "regex"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HydrationProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <Header />
          {children}
          <Footer />
        </HydrationProvider>
      </body>
    </html>
  );
}
