import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Clock, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/fr"
import { Link } from "react-router"

// Configuration de dayjs
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.locale('fr')

interface Product {
  id: number
  slug: string
  name: string
  price: string
  originalPrice?: string
  promoEndDate?: string
  image: string
  category: string
}

interface ProductCardProps {
  product: Product
  className?: string
}

// Fonction pour calculer le temps restant avec dayjs
function getTimeRemaining(endDate: string) {
  const now = dayjs()
  const end = dayjs(endDate)
  
  if (end.isBefore(now)) return null
  
  const diff = dayjs.duration(end.diff(now))
  const days = diff.days()
  const hours = diff.hours()
  const minutes = diff.minutes()
  
  if (days > 0) return `${days}j ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Composant pour afficher les prix avec promotion
function ProductPrice({ price, originalPrice, promoEndDate }: {
  price: string
  originalPrice?: string
  promoEndDate?: string
}) {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    if (!promoEndDate) return
    
    const updateTimer = () => {
      const remaining = getTimeRemaining(promoEndDate)
      setTimeRemaining(remaining)
      
      if (remaining) {
        // Considérer comme urgent si moins de 24h (contient 'h' ou 'm' sans 'j')
        const isUrgentTime = !remaining.includes('j') && (remaining.includes('h') || remaining.includes('m'))
        setIsUrgent(isUrgentTime)
      }
    }
    
    // Mise à jour initiale
    updateTimer()
    
    // Mise à jour toutes les minutes
    const interval = setInterval(updateTimer, 60000)
    
    return () => clearInterval(interval)
  }, [promoEndDate])
  
  return (
    <div className="flex justify-between items-start gap-2">
      {/* Counter à gauche */}
      <div className="flex-shrink-0">
        {originalPrice && timeRemaining && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            isUrgent ? 'text-red-600 animate-pulse' : 'text-brand-gold'
          }`}>
            <Clock className="h-3 w-3" />
            <span>Fin dans {timeRemaining}</span>
          </div>
        )}
      </div>
      
      {/* Prix à droite */}
      <div className="text-right flex-shrink-0">
        {originalPrice && timeRemaining ? (
          <div className="flex items-center gap-2 justify-end">
            <div className="text-sm text-muted-foreground line-through decoration-2 decoration-red-500">{originalPrice}</div>
            <div className="text-2xl font-bold text-brand-purple">{price}</div>
          </div>
        ) : (
          <div className="text-2xl font-bold text-primary">{price}</div>
        )}
      </div>
    </div>
  )
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  return (
    <Card className={`group cursor-pointer hover:shadow-lg transition-shadow relative flex flex-col h-full pt-0 ${className}`}>
      {/* Badge PROMO à l'extrémité droite */}
      {product.originalPrice && product.promoEndDate && dayjs().isBefore(product.promoEndDate) && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="destructive" className="text-xs font-medium animate-pulse">
            PROMO
          </Badge>
        </div>
      )}
      
      {/* Image sans espace en haut */}
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-slate-200">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Contenu avec flex-grow pour pousser le bouton vers le bas */}
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-muted-foreground mb-2">{product.category}</div>
        
        {/* Nom du produit sans troncature */}
        <h3 className="font-semibold text-sm mb-3 leading-tight">{product.name}</h3>
        
        {/* Spacer pour pousser le prix et le bouton vers le bas */}
        <div className="flex-grow"></div>
        
        {/* Prix et counter */}
        <div className="mb-3">
          <ProductPrice 
            price={product.price}
            originalPrice={product.originalPrice}
            promoEndDate={product.promoEndDate}
          />
        </div>
        
        {/* Bouton toujours aligné en bas */}
        <Link 
          to={`/${product.slug}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-primary hover:bg-primary/90 active:scale-95 rounded-md"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Acheter maintenant
        </Link>
      </CardContent>
    </Card>
  )
}