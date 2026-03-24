import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { seedSampleData } from "@/lib/api"

function App() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Seed sample data on app load
    console.log('🌱 Initializing AquaBiz...')
    seedSampleData()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialized(true)
  }, [])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading AquaBiz...</p>
        </div>
      </div>
    )
  }

  return null
}

export default App