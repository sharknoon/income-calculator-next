import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  variable: "--font-geist-sans",
  src: "./geist.ttf",
  display: "swap",
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: "./geist-mono.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Income Calculator",
  description: "A simple income calculator to validate your employers math",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
