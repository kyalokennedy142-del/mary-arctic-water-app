import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Format category names for display
const formatCategoryName = (category) => {
  const names = {
    'water-bottles-filled': 'WATER BOTTLES-FILLED',
    'water-refills': 'WATER REFILLS',
    'packages': 'PACKAGES',
    'water-pumps': 'WATER PUMPS',
    'empty-bottles': 'EMPTY BOTTLES',
    'accessories': 'ACCESSORIES'
  }
  return names[category] || category.toUpperCase().replace('-', ' ')
}

export default function EnhancedSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  showQuantity = false,
  groupBy = null,
  disabled = false,
  className = ""
}) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredOptions = options.filter(opt => 
    opt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedOptions = groupBy 
    ? filteredOptions.reduce((groups, option) => {
        const group = option[groupBy] || 'Other'
        if (!groups[group]) groups[group] = []
        groups[group].push(option)
        return groups
      }, {})
    : null

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          id={id} 
          className="input-enhanced rounded-xl bg-card border-2 border-border hover:border-primary/50 focus:border-primary transition-all shadow-sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent 
          className="max-h-60 bg-card border-2 border-border shadow-xl"
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
        >
          {/* Search input */}
          <div className="p-2 border-b-2 border-border bg-secondary/30 sticky top-0 z-10">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="overflow-y-auto max-h-48">
            {groupedOptions ? (
              Object.entries(groupedOptions).map(([group, items]) => (
                <div key={group}>
                  {/* Category header */}
                  <div className="px-3 py-2 text-xs font-semibold text-primary uppercase tracking-wider bg-primary/5 sticky top-12">
                    {formatCategoryName(group)}
                  </div>
                  {items.map((item) => (
                    <SelectItem 
                      key={item.id} 
                      value={item.id}
                      className="cursor-pointer hover:bg-primary/20 focus:bg-primary/20 bg-white"
                    >
                      <div className="flex items-center justify-between w-full py-2 px-2">
                        <span className="truncate text-foreground font-medium">
                          {item.name || item.product_name}
                        </span>
                        {showQuantity && item.quantity !== undefined && (
                          <span className="ml-2 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {item.quantity} left
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))
            ) : (
              filteredOptions.map((item) => (
                <SelectItem 
                  key={item.id} 
                  value={item.id}
                  className="cursor-pointer hover:bg-primary/20 focus:bg-primary/20 bg-white"
                >
                  <div className="flex items-center justify-between w-full py-2 px-2">
                    <span className="truncate text-foreground font-medium">
                      {item.name || item.product_name}
                    </span>
                    {showQuantity && item.quantity !== undefined && (
                      <span className="ml-2 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {item.quantity} left
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </div>
          
          {filteredOptions.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground bg-secondary/20">
              No results found
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}