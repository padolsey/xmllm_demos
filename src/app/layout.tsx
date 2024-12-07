import type { Metadata } from "next";
import localFont from "next/font/local";
import ThemeProvider from "./theme-provider";
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
  title: "XMLLM Client Tests",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {isColorsPage ? (
          children
        ) : (
          <ThemeProvider>
            {children}
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}
