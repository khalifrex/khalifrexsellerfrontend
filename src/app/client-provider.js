"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';
import { useState } from 'react';

export default function ClientProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <CartProvider>{children}</CartProvider>
    </QueryClientProvider>
  );
}
