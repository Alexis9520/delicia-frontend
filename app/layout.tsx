import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/layout/navbar"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Panadería Delicia",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="es">
        <head>
          <link rel="icon" href="/cuerno.png" type="image/png" />
        </head>
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
          <main className="w-full">{children}</main>
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}