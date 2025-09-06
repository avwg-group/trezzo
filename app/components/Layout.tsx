import { Navbar } from "~/components/Navbar"
import { Footer } from "~/components/Footer"
import { useLocation } from "~/lib/useLocation"
import { createContext, useContext } from "react"
import type { LocationData } from "~/services/locationService"

// Contexte pour partager les données de localisation
interface LocationContextType {
  locationData: LocationData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Hook pour utiliser le contexte de localisation
export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode
  shop_name?: string
  logo_url?: string;
}

export function Layout({ children, shop_name, logo_url }: LayoutProps) {
  const locationContext = useLocation();

  return (
    <LocationContext.Provider value={locationContext}>
      <div className="min-h-screen flex flex-col overflow-hidden">
        <Navbar shop_name={shop_name} logo_url={logo_url} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </LocationContext.Provider>
  )
}