import { Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <a href="/" className="text-xl font-bold text-primary">
              Trezzo
            </a>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="/contact" className="hover:text-foreground transition-colors">Nous contacter</a></li>
              <li><a href="/refund-policy" className="hover:text-foreground transition-colors">Politique de remboursement</a></li>
            </ul>
          </div>
          
          {/* Légal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Légal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/legal" className="hover:text-foreground transition-colors">Mentions légales</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">CGV</a></li>
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Politique de confidentialité</a></li>
            </ul>
          </div>
          
          {/* Réseaux sociaux */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2025 Trezzo - Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}