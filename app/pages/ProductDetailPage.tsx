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

// Configuration de dayjs
dayjs.extend(duration)
dayjs.locale('fr')

// Données d'exemple du produit
const productData = {
  id: 1,
  name: "Template E-commerce Premium",
  price: "49€",
  originalPrice: "79€",
  promoEndDate: "2025-12-31T23:59:59",
  image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop",
  category: "Templates",
  shortDescription: "Un template e-commerce moderne et responsive, parfait pour lancer votre boutique en ligne rapidement.",
  purchaseCount: 1247,
  rating: 4.8,
  reviewCount: 156
}

// Logos des moyens de paiement
const paymentMethods = [
  { name: "Visa", logo: "/images/visa.png" },
  { name: "Mastercard", logo: "/images/mastercard.svg" },
  { name: "Orange Money", logo: "/images/orangemoney.svg" },
  { name: "Airtel", logo: "/images/airtel.png" },
  { name: "MTN MONEY", logo: "/images/mtnmoney.svg" }
]

// Avis clients
const reviews = [
  {
    id: 1,
    name: "Marie L.",
    rating: 5,
    comment: "Excellent template, très facile à personnaliser !",
    date: "Il y a 2 jours"
  },
  {
    id: 2,
    name: "Thomas K.",
    rating: 5,
    comment: "Parfait pour mon e-commerce, je recommande vivement.",
    date: "Il y a 1 semaine"
  },
  {
    id: 3,
    name: "Sophie M.",
    rating: 4,
    comment: "Très bon rapport qualité-prix, support réactif.",
    date: "Il y a 2 semaines"
  }
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

export function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(productData.image)
  const hasPromo = productData.originalPrice && productData.promoEndDate

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section gauche - 2/3 de l'espace sur desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image du produit */}
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <img 
                src={selectedImage} 
                alt={productData.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
              />
            </div>

            {/* Titre et prix mobile */}
            <div className="lg:hidden">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{productData.category}</Badge>
                {hasPromo && (
                  <Badge variant="destructive" className="text-xs animate-pulse">PROMO</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-4">{productData.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">{productData.price}</span>
                {productData.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through decoration-2 decoration-destructive">
                    {productData.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Titre et prix desktop */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{productData.category}</Badge>
                {hasPromo && (
                  <Badge variant="destructive" className="text-xs animate-pulse">PROMO</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{productData.name}</h1>
            </div>

            {/* Description courte */}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {productData.shortDescription}
            </p>

            {/* CTA mobile */}
            <div className="lg:hidden">
              <Button size="lg" className="w-full mb-4">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Acheter maintenant
              </Button>
            </div>

            {/* Sections détaillées en accordéon */}
            <Accordion type="single" collapsible className="w-full hidden">
              <AccordionItem value="about">
                <AccordionTrigger>À propos</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Ce template e-commerce premium a été conçu avec les dernières technologies web pour offrir 
                      une expérience utilisateur exceptionnelle. Entièrement responsive et optimisé pour le SEO.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Design moderne et professionnel
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Compatible tous navigateurs
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Optimisé pour mobile
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="includes">
                <AccordionTrigger>Ce que vous recevez</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>15+ pages HTML complètes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Fichiers CSS et JavaScript optimisés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Documentation complète</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Fichiers sources PSD/Figma</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Support technique 6 mois</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="usage">
                <AccordionTrigger>Utilisation</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Installation simple en 3 étapes :
                    </p>
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>Téléchargez et décompressez l'archive</li>
                      <li>Uploadez les fichiers sur votre serveur</li>
                      <li>Personnalisez selon vos besoins</li>
                    </ol>
                    <p className="text-sm">
                      Aucune connaissance technique avancée requise. Guide d'installation inclus.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="license">
                <AccordionTrigger>Conditions/Licence</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Licence commerciale incluse</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Utilisation sur projets illimités</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Revente autorisée après modification</span>
                    </div>
                    <p className="text-sm mt-4">
                      Licence étendue permettant une utilisation commerciale complète.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">Avis clients</h3>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${
                        i < Math.floor(productData.rating) 
                          ? 'text-accent fill-current' 
                          : 'text-secondary/30'
                      }`} 
                    />
                  ))}
                </div>
                <span className="font-semibold text-primary">{productData.rating}</span>
                <span className="text-muted-foreground">({productData.reviewCount} avis)</span>
              </div>
              
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-primary/10 hover:border-primary/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">{review.name}</span>
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-accent fill-current" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-secondary">{review.date}</span>
                      </div>
                      <p className="text-secondary/80">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
                        <span className="text-4xl font-bold text-primary">{productData.price}</span>
                        {productData.originalPrice && (
                          <span className="text-2xl text-muted-foreground line-through decoration-2 decoration-destructive">
                            {productData.originalPrice}
                          </span>
                        )}
                      </div>
                      
                      {hasPromo && productData.promoEndDate && (
                        <DigitalCountdown endDate={productData.promoEndDate} />
                      )}
                    </div>
                    
                    <Button size="lg" className="w-full mb-6">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Acheter maintenant
                    </Button>
                    
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
              
              {/* Version mobile sticky bottom */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
                {hasPromo && productData.promoEndDate && (
                  <div className="mb-3">
                    <DigitalCountdown endDate={productData.promoEndDate} />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{productData.price}</span>
                      {productData.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through decoration-2 decoration-destructive">
                          {productData.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="lg" className="flex-1">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Acheter
                  </Button>
                </div>
                
                {/* Logos moyens de paiement mobile */}
                <div className="flex justify-center items-center gap-2">
                  {paymentMethods.map((method, index) => (
                    <div 
                      key={index}
                      className="w-8 h-5 bg-card border rounded flex items-center justify-center text-sm shadow-sm"
                      title={method.name}
                    >
                      {method.logo}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Espace pour le sticky mobile */}
      <div className="lg:hidden h-32"></div>
    </Layout>
  )
}