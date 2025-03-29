import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { Toaster } from "@/components/ui/sonner";
import { ComponentsProvider } from "@/context/components-context";

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
  const locale = useLocale();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <ComponentsProvider>{children}</ComponentsProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
