import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../index.css'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import WhatsAppButton from "@/components/WhatsAppButton";
import ClientProviders from './providers';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Avid Explores - Adventure Travel & Stories',
  description: 'Discover amazing adventures, read inspiring travel stories, and join our community of explorers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}

            <WhatsAppButton />
          </TooltipProvider>
        </ClientProviders>
      </body>
    </html>
  )
}