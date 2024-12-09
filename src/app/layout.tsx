import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from 'sonner'
import ThemeProvider from "./theme-provider";
import { Navbar } from "@/components/Navbar";
import { ErrorProvider } from "@/contexts/ErrorContext";
import "./globals.css";
import { headers } from 'next/headers'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: 'xmllm playground & demos',
    template: '%s - xmllm'
  },
  description: "Test interface for XMLLM client",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const isColorsPage = headersList.get('x-is-colors-page') === '1'

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ErrorProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1 p-8">
              <div className="max-w-[1800px] mx-auto">
                {children}
              </div>
            </main>
            <Toaster position="top-center" />
          </ThemeProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
