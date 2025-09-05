import { useState } from "react"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { Menu, X } from "lucide-react"

interface NavbarProps {
  shop_name?: string;
  logo_url?: string;
}

export function Navbar({ shop_name, logo_url }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Fonction pour rendre le logo/nom de manière intelligente
  const renderBrand = () => {
    // Logo prioritaire - si disponible, on affiche uniquement le logo
    if (logo_url) {
      return (
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img 
            src={logo_url} 
            alt={shop_name || "Logo"} 
            className="h-8 w-auto max-w-[200px] object-contain"
            onError={(e) => {
              // Si l'image échoue, on recharge la page avec le nom à la place
              console.warn('Logo failed to load, falling back to shop name');
              // Optionnel: vous pouvez forcer un re-render sans logo
            }}
          />
        </Link>
      );
    }
    
    // Sinon, affichage du nom uniquement
    return (
      <Link to="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
        {shop_name || "ZestyLinks"}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand - Intelligent */}
          <div className="flex-shrink-0">
            {renderBrand()}
          </div>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/products" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Produits
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              À propos
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
          
          {/* Desktop - Bouton Se connecter */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Se connecter
            </Button>
          </div>

          {/* Mobile - Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/products"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Produits
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="px-3 py-2">
                <Button variant="outline" size="sm" className="w-full">
                  Se connecter
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}