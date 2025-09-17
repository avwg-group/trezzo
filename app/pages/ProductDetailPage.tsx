import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent } from "~/components/ui/card"
import { Layout } from "~/components/Layout"
import { 
  Clock, 
  ShoppingCart, 
  Check, 
  Mail, 
  Shield, 
  Headphones,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import "dayjs/locale/fr"
import type { ProductDetailsResponse } from "~/services/types"
import { Link } from "react-router"

// Configuration de dayjs
dayjs.extend(duration)
dayjs.locale('fr')

// Interface pour les props
interface ProductDetailPageProps {
  loaderData: {
    product: ProductDetailsResponse['product'];
    customFields: ProductDetailsResponse['custom_fields'];
    faqItems: ProductDetailsResponse['faq_items'];
    reviews: ProductDetailsResponse['reviews'];
    shop: ProductDetailsResponse['shop'];
    error: string | null;
  };
}

// Logos des moyens de paiement
const paymentMethods = [
  { name: "Visa", logo: "/images/visa.png" },
  { name: "Mastercard", logo: "/images/mastercard.svg" },
  { name: "Orange Money", logo: "/images/orangemoney.svg" },
  { name: "Airtel", logo: "/images/airtel.png" },
  { name: "MTN MONEY", logo: "/images/mtnmoney.svg" }
]

// Fonction pour calculer le temps restant
function getTimeRemaining(endDate: string) {
  const now = dayjs()
  const end = dayjs(endDate)
  
  if (end.isBefore(now)) return null
  
  const diff = dayjs.duration(end.diff(now))
  const days = diff.days()
  const hours = diff.hours()
  const minutes = diff.minutes()
  const seconds = diff.seconds()
  
  return { days, hours, minutes, seconds }
}

// Composant Countdown numérique
function DigitalCountdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(endDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (!timeLeft) return null

  return (
    <div className="bg-card border border-primary/20 text-primary p-4 rounded-lg font-mono text-center mb-4">
      <div className="text-xs mb-2 text-muted-foreground">OFFRE LIMITÉE</div>
      <div className="grid grid-cols-4 gap-2 text-lg font-bold">
        <div className="bg-muted p-2 rounded border border-primary/30">
          <div className="text-2xl">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">JOURS</div>
        </div>
        <div className="bg-muted p-2 rounded border border-primary/30">
          <div className="text-2xl">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">HEURES</div>
        </div>
        <div className="bg-muted p-2 rounded border border-primary/30">
          <div className="text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">MIN</div>
        </div>
        <div className="bg-muted p-2 rounded border border-primary/30">
          <div className="text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground">SEC</div>
        </div>
      </div>
    </div>
  )
}

export function ProductDetailPage({ loaderData }: ProductDetailPageProps) {
  const { product, customFields, faqItems, reviews, shop } = loaderData
  const [selectedImage, setSelectedImage] = useState(product?.product_image || '')
  
  // Vérifier si le produit a une promotion
  const hasPromo = product?.promo_price 
  const displayPrice = hasPromo ? product.promo_price : product?.price
  const originalPrice = hasPromo ? product.price : null
  // Formatage des prix
  const formatPrice = (price: number) => `${price}`

  if (!product) {
    return (
      <Layout shop_name={shop?.name} logo_url={shop?.logo_url}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit introuvable</h1>
          <p className="text-muted-foreground">Ce produit n'existe pas ou n'est plus disponible.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout shop_name={shop?.name} logo_url={shop?.logo_url}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section gauche - 2/3 de l'espace sur desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image du produit */}
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <img 
                src={selectedImage || product.product_image} 
                alt={product.product_name}
                className="w-full aspect-[1.91/1] sm:aspect-square max-w-[1200px] max-h-[1080px] object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
              />
            </div>

            {/* Titre et prix mobile */}
            <div className="lg:hidden">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs uppercase">{product.category}</Badge>
                {hasPromo && (
                  <Badge variant="destructive" className="text-xs animate-pulse">PROMO</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-4">{product.product_name}</h1>
            </div>

            {/* Titre et prix desktop */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                {hasPromo && (
                  <Badge variant="destructive" className="text-xs animate-pulse">PROMO</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
            </div>

            {/* Description */}
            <div 
              className="text-lg text-muted-foreground leading-relaxed prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* FAQ Section */}
            {faqItems.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Questions fréquentes</h3>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <div 
                          className="text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Champs personnalisés */}
            {customFields.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Informations supplémentaires</h3>
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <div key={field.id} className="flex items-start gap-3">
                      <span className="font-medium text-primary min-w-0 flex-shrink-0">{field.name}:</span>
                      <span className="text-muted-foreground">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Éléments de réassurance */}
            <Card className="hover:border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-primary">Nos garanties</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-secondary" />
                    <span className="text-sm text-muted-foreground">Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-secondary" />
                    <span className="text-sm text-muted-foreground">Livraison immédiate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Headphones className="h-5 w-5 text-secondary" />
                    <span className="text-sm text-muted-foreground">Support premium</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Avis clients */}
            {reviews && reviews.stats.total_reviews > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Avis clients</h3>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < Math.floor(reviews.stats.average_rating) 
                            ? 'text-accent fill-current' 
                            : 'text-secondary/30'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-primary">{reviews.stats.average_rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.stats.total_reviews} avis)</span>
                </div>
                
                <div className="space-y-4">
                  {reviews.items.map((review) => (
                    <Card key={review.id} className="border-primary/10 hover:border-primary/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">{review.user_name}</span>
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-accent fill-current" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-secondary">
                            {dayjs(review.created_at).fromNow()}
                          </span>
                        </div>
                        <p className="text-secondary/80">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section droite - 1/3 de l'espace sur desktop */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Prix et promo desktop */}
              <div className="hidden lg:block">
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    {/* Prix centré */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-4xl font-bold text-primary">{formatPrice(displayPrice!)}</span>
                        {originalPrice && (
                          <span className="text-2xl text-muted-foreground line-through decoration-2 decoration-destructive">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Link to={`/${product.slug}/checkout?productSlug=${product.slug}`} className="block">
                      <Button size="lg" className="w-full mb-6">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Acheter maintenant
                      </Button>
                    </Link>
                    
                    {/* Payment methods logos */}
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3 text-center">Moyens de paiement acceptés</p>
                      <div className="flex justify-center items-center gap-4">
                        {paymentMethods.map((method, index) => (
                          <div 
                            key={index}
                            className="w-12 h-8 bg-white rounded-md shadow-sm border border-gray-100 flex items-center justify-center p-1 transition-all hover:shadow-md"
                            title={method.name}
                          >
                            <img 
                              src={method.logo} 
                              alt={method.name} 
                              className="w-full h-full object-contain opacity-90 hover:opacity-100"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Version mobile sticky bottom - Bouton d'achat fixe */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-50">
        <div className="container mx-auto px-4 py-3">
          {/* Prix et bouton principal */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">{formatPrice(displayPrice!)}</span>
                {originalPrice && (
                  <span className="text-xs text-muted-foreground line-through decoration-1 decoration-destructive -mt-1">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>
            <Button size="lg" className="flex-1 max-w-[180px] shadow-lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Acheter
            </Button>
          </div>
          
          {/* Logos moyens de paiement mobile */}
          <div className="flex justify-center items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">Paiement sécurisé:</span>
            {paymentMethods.map((method, index) => (
              <div 
                key={index}
                className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm"
                title={method.name}
              >
                <img 
                  src={method.logo} 
                  alt={method.name} 
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Espace pour le sticky mobile - Augmenté pour plus d'espace */}
      <div className="lg:hidden h-36"></div>
    </Layout>
  )
}