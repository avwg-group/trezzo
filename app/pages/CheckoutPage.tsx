import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Layout } from "~/components/Layout"
import { 
  ShoppingCart, 
  Shield, 
  CreditCard,
  Lock,
  CheckCircle,
  Tag,
  ChevronsUpDown,
  Check
} from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Label } from "~/components/ui/label"
import { cn } from "~/lib/utils"

// Données d'exemple du produit
const productData = {
  id: 1,
  name: "Template E-commerce Premium",
  price: "49",
  originalPrice: "79",
  image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=300&h=200&fit=crop",
  category: "Templates"
}

// Liste des pays avec drapeaux et indicatifs
const countries = [
  { value: "fr", label: "France", code: "+33", flag: "🇫🇷" },
  { value: "be", label: "Belgique", code: "+32", flag: "🇧🇪" },
  { value: "ch", label: "Suisse", code: "+41", flag: "🇨🇭" },
  { value: "ca", label: "Canada", code: "+1", flag: "🇨🇦" },
  { value: "ma", label: "Maroc", code: "+212", flag: "🇲🇦" },
  { value: "sn", label: "Sénégal", code: "+221", flag: "🇸🇳" },
  { value: "ci", label: "Côte d'Ivoire", code: "+225", flag: "🇨🇮" },
  { value: "ao", label: "Angola", code: "+244", flag: "🇦🇴" },
  { value: "ai", label: "Anguilla", code: "+1264", flag: "🇦🇮" },
  { value: "aq", label: "Antarctica", code: "+672", flag: "🇦🇶" },
  { value: "ag", label: "Antigua", code: "+1268", flag: "🇦🇬" }
]

// Moyens de paiement sécurisés
const paymentMethods = [
  { name: "Visa", icon: "💳" },
  { name: "Mastercard", icon: "💳" },
  { name: "PayPal", icon: "🅿️" },
  { name: "Mobile Money", icon: "📱" }
]

export function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  })
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [open, setOpen] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCountryChange = (countryValue: string) => {
    const country = countries.find(c => c.value === countryValue)
    if (country) {
      setSelectedCountry(country)
      setOpen(false)
    }
  }

  const handlePromoCode = () => {
    if (promoCode.trim()) {
      setPromoApplied(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const isFormValid = formData.fullName && formData.email && formData.phone

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Header épuré */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-light text-foreground mb-3">Finaliser la commande</h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-brand-purple to-brand-gold mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Section gauche - Formulaire (3/5) */}
              <div className="lg:col-span-3 space-y-6">
                {/* Informations personnelles */}
                <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                  <h2 className="text-lg font-medium text-card-foreground mb-6">Informations</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom complet */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">Nom complet</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Votre nom complet"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="border-border focus:border-ring focus:ring-ring/20 rounded-xl h-12"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                        Adresse email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="border-border focus:border-ring focus:ring-ring/20 rounded-xl h-12"
                        required
                      />
                      <p className="text-xs text-brand-gold flex items-center gap-1">
                        <span>⚡</span> Livraison instantanée par email
                      </p>
                    </div>

                    {/* Téléphone avec Combobox */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Téléphone</Label>
                      <div className="flex rounded-xl border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/20 overflow-hidden">
                        {/* Combobox pour les pays */}
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-auto min-w-[100px] h-12 rounded-none flex items-center justify-center shadow-none border-none"
                            >
                              <div className="flex items-center gap-2">
                                <span>{selectedCountry.flag}</span>
                                <span className="text-sm">{selectedCountry.code}</span>
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher un pays..." />
                              <CommandList>
                                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                                <CommandGroup>
                                  {countries.map((country) => (
                                    <CommandItem
                                      key={country.value}
                                      value={country.label}
                                      onSelect={() => handleCountryChange(country.value)}
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <span>{country.flag}</span>
                                        <span className="flex-1">{country.label}</span>
                                        <span className="text-muted-foreground">({country.code})</span>
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedCountry.value === country.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        {/* Champ de saisie du numéro */}
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="6 12 34 56 78"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="border-0 rounded-none flex-1 focus-visible:ring-0 h-12"
                          required
                        />
                      </div>
                    </div>
                  </form>
                </div>

                {/* Code promo */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-4 w-4 text-brand-purple" />
                    <h3 className="font-medium text-card-foreground">Code de réduction</h3>
                  </div>
                  
                  <div className="flex gap-3">
                    <Input
                      placeholder="Code promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                      className="border-border focus:border-ring focus:ring-ring/20 rounded-xl"
                    />
                    <Button 
                      type="button" 
                      variant={promoApplied ? "default" : "outline"}
                      onClick={handlePromoCode}
                      disabled={!promoCode.trim() || promoApplied}
                      className="rounded-xl px-6"
                    >
                      {promoApplied ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        "Appliquer"
                      )}
                    </Button>
                  </div>
                  
                  {promoApplied && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 p-3 rounded-xl">
                      <CheckCircle className="h-4 w-4" />
                      <span>Réduction appliquée !</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section droite - Résumé (2/5) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Résumé du produit */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-6">
                  <h3 className="font-medium text-card-foreground mb-6">Commande</h3>
                  
                  {/* Produit */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={productData.image} 
                        alt={productData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-card-foreground truncate">{productData.name}</h4>
                      <Badge variant="secondary" className="text-xs mt-1 bg-brand-purple/10 text-brand-purple border-brand-purple/20">
                        {productData.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="space-y-3 py-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium text-card-foreground">{productData.price}</span>
                    </div>
                    
                    {promoApplied && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Réduction</span>
                        <span>-10</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-semibold pt-3 border-t border-border">
                      <span className="text-card-foreground">Total</span>
                      <div className="text-right">
                        <div className="text-brand-purple">
                          {promoApplied ? "39" : productData.price}
                        </div>
                        {productData.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {productData.originalPrice}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sécurité */}
                  <div className="space-y-3 py-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span>Paiement sécurisé SSL</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span>Livraison instantanée</span>
                    </div>
                  </div>

                  {/* Moyens de paiement */}
                  <div className="py-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">Paiement accepté</p>
                    <div className="flex gap-2 items-center justify-center">
                      {paymentMethods.map((method, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-center w-10 h-8 bg-muted rounded-lg border border-border"
                        >
                          <span className="text-sm">{method.icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bouton de paiement */}
                  <Button 
                    size="lg" 
                    className="w-full mt-6 rounded-xl h-12 font-medium bg-primary" 
                    disabled={!isFormValid || isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      "Traitement..."
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payer maintenant
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
                    Paiement sécurisé • Satisfaction garantie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}