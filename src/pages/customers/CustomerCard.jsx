import { User, Phone, MapPin } from 'lucide-react'

export default function CustomerCard({ customer, onClick, isSelected }) {
  return (
    <button
      onClick={() => onClick(customer)}
      className={`w-full text-left bg-card rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:border-primary/30 ${
        isSelected ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-accent-foreground" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-foreground truncate">{customer.name}</h4>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>{customer.phone}</span>
          </div>
          {customer.location && (
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{customer.location}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}