import type { Metadata } from "next";
import {
  DM_Sans,
  Geist,
  Geist_Mono,
  Google_Sans,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmsans = DM_Sans({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payze",
  description: "Payze",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col ">
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
