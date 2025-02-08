export const dynamic = 'force-dynamic';
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

import './globals.css'
import { ModalProvider } from '@/providers/modal-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { ThemeProvider } from "@/components/providers/theme-provider"
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Moxium - Store Management Platform',
  description: 'Store management platform for businesses. Streamline your inventory, sales, and customer relationships.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <ToastProvider />
          <ModalProvider />
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
