import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi, stockApi, salesApi } from './api'

// ============================================
// CUSTOMERS HOOKS
// ============================================

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    }
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    }
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    }
  })
}

// ============================================
// SALES HOOKS
// ============================================

export const useCustomerSales = (customerId) => {
  return useQuery({
    queryKey: ['sales', 'customer', customerId],
    queryFn: () => salesApi.getByCustomerId(customerId),
    enabled: !!customerId
  })
}

// ============================================
// STOCK HOOKS
// ============================================

export const useStock = () => {
  return useQuery({
    queryKey: ['stock'],
    queryFn: stockApi.getAll
  })
}

export const useCreateStock = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: stockApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    }
  })
}

export const useCreateSale = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (saleData) => {
      await stockApi.reduceQuantity(saleData.stock_id, saleData.quantity_sold)
      return await salesApi.create(saleData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    }
  })
}

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: salesApi.getAll
  })
}