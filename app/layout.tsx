import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono, Google_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const googlesans = Google_Sans({
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
      className={`${dmsans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
