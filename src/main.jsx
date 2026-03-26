import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// ✅ HashRouter for GitHub Pages compatibility
import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'

// Context & Providers
import { DataProvider } from '@/context/DataContext'

// ✅ Navbar Component (standalone, sticky top)
import Navbar from '@/components/Navbar'

// Pages
import Dashboard from '@/pages/Dashboard'
import Customers from '@/pages/customers/Customers'
import Stock from '@/pages/stock/Stock'
import Sales from '@/pages/sales/Sales'
import Reports from '@/pages/reports/Reports'

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Cache data for 1 minute
      retry: 1 // Retry failed requests once
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        {/* ✅ HashRouter for GitHub Pages (no basename needed) */}
        <HashRouter>
          {/* ✅ Navbar - Sticky top navigation */}
          <Navbar />
          
          {/* ✅ Main Content Area - Responsive container */}
          <main className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/stock" element={<Stock />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </div>
          </main>
          
          {/* ✅ Toast Notifications - Top right, rich colors */}
          <Toaster position="top-right" richColors closeButton />
        </HashRouter>
      </DataProvider>
    </QueryClientProvider>
  </StrictMode>
)