'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

import AuthProvider from "@/components/AuthProvider";

const queryClient = new QueryClient();

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
}