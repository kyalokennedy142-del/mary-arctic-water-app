import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// ✅ HashRouter for GitHub Pages compatibility
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'

// Context & Providers
import { DataProvider } from '@/context/DataContext'
import { AuthProvider } from '@/context/AuthContext'  // ✅ ADDED: Auth context provider

// ✅ Navbar Component (standalone, sticky top)
import Navbar from '@/components/Navbar'

// ✅ Protected Route Component
import ProtectedRoute from '@/components/ProtectedRoute'

// Pages - Existing
import Dashboard from '@/pages/Dashboard'
import Customers from '@/pages/customers/Customers'
import Stock from '@/pages/stock/Stock'
import Sales from '@/pages/sales/Sales'
import Reports from '@/pages/reports/Reports'

// ✅ Pages - Auth (CORRECTED PATHS)
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

// Create QueryClient for React Query
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
      {/* ✅ WRAP WITH AuthProvider - enables useAuth() throughout app */}
      <AuthProvider>
        <DataProvider>
          <HashRouter>
            <Navbar />
            <main className="min-h-screen bg-background">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Routes>
                  {/* ✅ Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* ✅ Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers" element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  } />
                  <Route path="/stock" element={
                    <ProtectedRoute>
                      <Stock />
                    </ProtectedRoute>
                  } />
                  <Route path="/sales" element={
                    <ProtectedRoute>
                      <Sales />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  
                  {/* ✅ 404 */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </main>
            <Toaster position="top-right" richColors closeButton />
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)