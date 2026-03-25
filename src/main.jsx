import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'  // ✅ Keep this
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'

import { DataProvider } from '@/context/DataContext'
import Layout from '@/components/layouts/Layout'
import Dashboard from '@/pages/Dashboard'
import Customers from '@/pages/customers/Customers'
import Stock from '@/pages/stock/Stock'
import Sales from '@/pages/sales/Sales'

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        {/* ✅ ADD basename HERE - must match your repo name */}
        <BrowserRouter basename="/mary-arctic-water-app">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="stock" element={<Stock />} />
              <Route path="sales" element={<Sales />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </DataProvider>
    </QueryClientProvider>
  </StrictMode>
)