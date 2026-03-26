import { Users } from 'lucide-react'
import DataCard from '@/components/ui/DataCard'

export default function CustomerList({ customers = [], loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card-enhanced p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <DataCard
      title={`All Customers (${customers.length})`}
      icon={Users}
    >
      {customers.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No customers yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <div key={customer.id} className="card-enhanced p-4">
              <h4 className="font-semibold">{customer.name}</h4>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
          ))}
        </div>
      )}
    </DataCard>
  )
}