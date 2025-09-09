import { useState, useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Layout } from "~/components/Layout";
import { Form, useSubmit, useNavigation } from "react-router";
import { 
  ShoppingCart, 
  Shield, 
  CreditCard,
  Lock,
  CheckCircle,
  Tag,
  ChevronsUpDown,
  Check,
  MapPin,
  Globe,
  Loader2,
  Zap,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import type { ProductDetails, Discount } from "~/services/types";

// Moyens de paiement avec support étendu
const paymentMethods = [
  { name: "Visa", icon: "/images/visa.png", description: "Carte bancaire" },
  { name: "Mastercard", icon: "/images/mastercard.svg", description: "Carte bancaire" },
  { name: "MTN Money", icon: "/images/mtnmoney.svg", description: "Mobile Money" },
  { name: "Orange Money", icon: "/images/orangemoney.svg", description: "Mobile Money" },
  { name: "Airtel Money", icon: "/images/airtel.png", description: "Mobile Money" },
];

// Interface pour les données de pays
interface CountryData {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  currency?: string;
}

// Fonction pour récupérer les données de pays depuis une API REST Countries
// Cache global pour les pays (évite les requêtes répétées)
let countriesCache: CountryData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

// Fonction pour récupérer les données de pays avec cache
const fetchCountryData = async (): Promise<CountryData[]> => {
  // Vérifier si le cache est valide
  const now = Date.now();
  if (countriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 Utilisation du cache des pays');
    return countriesCache;
  }
  
  try {
    console.log('🌐 Chargement des pays depuis l\'API');
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag,currencies');
    const countries = await response.json();
    
    const processedCountries = countries.map((country: any) => ({
      name: country.name.common,
      code: country.cca2,
      dialCode: country.idd?.root ? `${country.idd.root}${country.idd.suffixes?.[0] || ''}` : '',
      flag: country.flag,
      currency: Object.keys(country.currencies || {})[0] || ''
    })).filter((country: CountryData) => country.dialCode)
      .sort((a: CountryData, b: CountryData) => a.name.localeCompare(b.name));
    
    // Mettre à jour le cache
    countriesCache = processedCountries;
    cacheTimestamp = now;
    
    return processedCountries;
  } catch (error) {
    console.error('Erreur lors du chargement des pays:', error);
    // Fallback avec quelques pays essentiels
    const fallbackCountries = [
      { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", currency: "EUR" },
      { name: "Cameroun", code: "CM", dialCode: "+237", flag: "🇨🇲", currency: "XAF" },
      { name: "Sénégal", code: "SN", dialCode: "+221", flag: "🇸🇳", currency: "XOF" },
      { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", currency: "CAD" },
      { name: "Maroc", code: "MA", dialCode: "+212", flag: "🇲🇦", currency: "MAD" }
    ];
    
    // Mettre en cache même le fallback
    countriesCache = fallbackCountries;
    cacheTimestamp = now;
    
    return fallbackCountries;
  }
};

// Fonction pour sélection manuelle du pays (plus de détection automatique)
const selectUserCountry = async (locationData: any, shopCurrency?: string): Promise<CountryData> => {
  const countries = await fetchCountryData();
  
  // Priorité 1: Devise du shop
  if (shopCurrency) {
    const shopCountry = countries.find(c => c.currency === shopCurrency);
    if (shopCountry) {
      console.log(`🏪 Pays suggéré via shop: ${shopCountry.name} (${shopCountry.currency})`);
      return shopCountry;
    }
  }
  
  // Priorité 2: Code pays de géolocalisation
  if (locationData?.country_code) {
    const suggestedCountry = countries.find(c => 
      c.code.toLowerCase() === locationData.country_code.toLowerCase()
    );
    if (suggestedCountry) {
      console.log(`🌍 Pays suggéré: ${suggestedCountry.name}`);
      return suggestedCountry;
    }
  }
  
  // Priorité 3: Devise de géolocalisation
  if (locationData?.currency) {
    const currencyCountry = countries.find(c => c.currency === locationData.currency);
    if (currencyCountry) {
      console.log(`💰 Pays suggéré via devise: ${currencyCountry.name} (${currencyCountry.currency})`);
      return currencyCountry;
    }
  }
  
  // Fallback vers le premier pays disponible
  return countries[0] || { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", currency: "EUR" };
};

interface CheckoutPageProps {
  loaderData: {
    product: ProductDetails;
    shop: any;
    locationData: any;
    error: string | null;
  };
  actionData?: {
    type: string;
    success: boolean;
    discount?: Discount;
    transaction?: any;
    message: string;
  };
}

export function CheckoutPage({ loaderData, actionData }: CheckoutPageProps) {
  const { product, shop, locationData, error } = loaderData;
  const submit = useSubmit();
  const navigation = useNavigation();
  
  // États pour la gestion des pays
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  
  // États du formulaire avec validation
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  
  // Chargement automatique des pays et détection
  useEffect(() => {
    const loadCountriesAndDetect = async () => {
      setIsLoadingCountries(true);
      try {
        const countriesData = await fetchCountryData();
        setCountries(countriesData);
        
        const detectedCountry = await detectUserCountry(locationData, shop?.currency);
        setSelectedCountry(detectedCountry);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    
    loadCountriesAndDetect();
  }, [locationData, shop?.currency]);
  
  // Fonction utilitaire pour extraire le prix numérique d'une chaîne formatée
  const extractNumericPrice = (priceString: string | number): number => {
    if (typeof priceString === 'number') return priceString;
    if (!priceString) return 0;
    
    // Extraire le nombre de la chaîne (ex: "100 XAF" -> 100)
    const match = priceString.toString().match(/([0-9]+(?:\.[0-9]+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };
  
  // Calculs de prix simplifiés et corrigés
  const priceCalculations = useMemo(() => {
    if (!product) return null;
    
    let basePrice: number;
    let isFlexiblePrice = false;
    let priceRange: { min: string; max: string } | null = null;
    
    // Gestion des différents types de prix
    if (product.product.pricing_type === "fixed") {
      basePrice = extractNumericPrice(product.product.promo_price || product.product.price);
    } else if (product.product.pricing_type === "flexible") {
      isFlexiblePrice = true;
      const minPrice = product.product.min_price || product.product.price;
      const maxPrice = product.product.max_price || product.product.price;
      priceRange = { min: minPrice.toString(), max: maxPrice.toString() };
      basePrice = extractNumericPrice(minPrice);
    } else {
      basePrice = extractNumericPrice(product.product.price);
    }
    
    // Calcul de la réduction si applicable
    let discountAmount = 0;
    if (appliedDiscount) {
      if (appliedDiscount.discount_type === 'percentage') {
        discountAmount = (basePrice * appliedDiscount.discount_value) / 100;
      } else {
        discountAmount = appliedDiscount.discount_value;
      }
    }
    
    const finalPrice = Math.max(0, basePrice - discountAmount);
    const currency = shop?.currency || selectedCountry?.currency || 'USD';
    
    return {
      basePrice,
      isFlexiblePrice,
      priceRange,
      hasPromoPrice: product.product.promo_price && product.product.promo_price !== product.product.price,
      originalPrice: product.product.price,
      discountAmount,
      finalPrice,
      currency,
      displayPrice: `${basePrice} ${currency}`,
      savingsPercentage: discountAmount > 0 ? Math.round((discountAmount / basePrice) * 100) : 0
    };
  }, [product, appliedDiscount, shop?.currency, selectedCountry?.currency]);
  
  // Validation du formulaire en temps réel
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Le nom complet est requis";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Le nom doit contenir au moins 2 caractères";
    }
    
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Le numéro de téléphone est requis";
    } else if (formData.phone.trim().length < 8) {
      errors.phone = "Numéro de téléphone trop court";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Gestion des changements de formulaire avec validation
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };
  
  // Gestion du changement de pays
  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setOpen(false);
      console.log(`🌍 Pays changé manuellement: ${country.name}`);
    }
  };
  
  // Application du code promo avec validation
  const handleApplyDiscount = () => {
    if (!promoCode.trim()) {
      return;
    }
    
    if (!shop?.id) {
      console.error('❌ Shop ID manquant pour appliquer la réduction');
      return;
    }
    
    const formData = new FormData();
    formData.append('actionType', 'applyDiscount');
    formData.append('shopId', shop.id);
    formData.append('discountCode', promoCode.trim().toUpperCase());
    
    console.log(`🏷️ Application du code promo: ${promoCode.trim().toUpperCase()}`);
    submit(formData, { method: 'post' });
  };
  
  // Soumission du formulaire avec validation complète
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !product || !priceCalculations || !selectedCountry) {
      console.log('❌ Validation du formulaire échouée');
      return;
    }
    
    const submitFormData = new FormData();
    submitFormData.append('actionType', 'createTransaction');
    submitFormData.append('fullName', formData.fullName.trim());
    submitFormData.append('email', formData.email.trim().toLowerCase());
    submitFormData.append('phone', `${selectedCountry.dialCode}${formData.phone.trim()}`);
    submitFormData.append('productId', product.product.id);
    submitFormData.append('shopId', shop?.id || 'default-shop');
    submitFormData.append('amount', priceCalculations.finalPrice.toString());
    
    console.log('💳 Création de la transaction:', {
      product: product.product.product_name,
      amount: priceCalculations.finalPrice,
      customer: formData.fullName,
      phone: `${selectedCountry.dialCode}${formData.phone}`,
      country: selectedCountry.name
    });
    
    submit(submitFormData, { method: 'post' });
  };
  
  // États de chargement et validation
  const isFormValid = Object.keys(formErrors).length === 0 && 
                     formData.fullName && formData.email && formData.phone && selectedCountry;
  const isLoading = navigation.state === 'submitting';
  const isApplyingDiscount = isLoading && navigation.formData?.get('actionType') === 'applyDiscount';
  const isCreatingTransaction = isLoading && navigation.formData?.get('actionType') === 'createTransaction';
  
  // Gestion des réponses d'action
  useEffect(() => {
    if (actionData?.type === 'discount') {
      if (actionData.success && actionData.discount) {
        setAppliedDiscount(actionData.discount);
        console.log('✅ Code promo appliqué:', actionData.discount.name);
      } else {
        console.log('❌ Code promo invalide:', actionData.message);
      }
    }
  }, [actionData]);
  
  // Affichage d'erreur si pas de produit
  if (error || !product || !priceCalculations) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-destructive mb-4">Erreur</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'Produit non trouvé ou données invalides'}
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Retour
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout shop_name={shop?.name || 'Boutique'} logo_url={shop?.logo_url}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header avec sélection manuelle */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light text-foreground mb-4">
                Finaliser la commande
              </h1>
              {locationData && selectedCountry && (
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-purple" />
                    <span>📍 {locationData.city}, {selectedCountry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-brand-gold" />
                    <span>💰 {priceCalculations.currency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-muted/50 px-2 py-1 rounded-full">
                    <span>✋ Sélection manuelle</span>
                  </div>
                </div>
              )}
              <div className="w-20 h-1 bg-gradient-to-r from-brand-purple to-brand-gold mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Section gauche - Formulaire (3/5) */}
              <div className="lg:col-span-3 space-y-8">
                {/* Informations personnelles */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Shield className="h-5 w-5 text-brand-purple" />
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form onSubmit={handleSubmit} className="space-y-6">
                      {/* Nom complet */}
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">
                          Nom complet *
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Votre nom complet"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className={cn(
                            "h-12 rounded-xl transition-all",
                            formErrors.fullName ? "border-destructive focus:border-destructive" : ""
                          )}
                          required
                        />
                        {formErrors.fullName && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Adresse email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={cn(
                            "h-12 rounded-xl transition-all",
                            formErrors.email ? "border-destructive focus:border-destructive" : ""
                          )}
                          required
                        />
                        {formErrors.email ? (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.email}
                          </p>
                        ) : (
                          <p className="text-xs text-brand-gold flex items-center gap-1">
                            <Zap className="h-3 w-3" /> 
                            Livraison instantanée par email
                          </p>
                        )}
                      </div>

                      {/* Téléphone avec détection automatique universelle */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Téléphone *
                        </Label>
                        <div className={cn(
                          "flex rounded-xl border transition-all overflow-hidden",
                          formErrors.phone ? "border-destructive" : "border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/20"
                        )}>
                          {/* Combobox pour tous les pays du monde */}
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-auto min-w-[140px] h-12 rounded-none flex items-center justify-center shadow-none border-none bg-muted/50"
                                disabled={isLoadingCountries}
                              >
                                {isLoadingCountries ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : selectedCountry ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{selectedCountry.flag}</span>
                                    <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm">Choisir pays</span>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0">
                              <Command>
                                <CommandInput placeholder="Rechercher un pays..." />
                                <CommandList>
                                  <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                                  <CommandGroup>
                                    {countries.map((country) => (
                                      <CommandItem
                                        key={country.code}
                                        value={`${country.name} ${country.dialCode}`}
                                        onSelect={() => handleCountryChange(country.code)}
                                        className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="text-lg">{country.flag}</span>
                                          <div className="flex flex-col">
                                            <span className="font-medium text-sm">{country.name}</span>
                                            <span className="text-xs text-muted-foreground">{country.currency}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                            {country.dialCode}
                                          </span>
                                          <Check
                                            className={cn(
                                              "h-4 w-4",
                                              selectedCountry?.code === country.code ? "opacity-100" : "opacity-0"
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
                            placeholder="Votre numéro de téléphone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="border-0 rounded-none flex-1 focus-visible:ring-0 h-12"
                            required
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.phone}
                          </p>
                        )}
                      </div>
                    </Form>
                  </CardContent>
                </Card>

                {/* Code promo */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Tag className="h-5 w-5 text-brand-gold" />
                      Code promo (optionnel)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Entrez votre code promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="h-12 rounded-xl flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={!promoCode.trim() || isApplyingDiscount}
                        variant="outline"
                        className="h-12 px-6 rounded-xl"
                      >
                        {isApplyingDiscount ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Appliquer"
                        )}
                      </Button>
                    </div>
                    
                    {appliedDiscount && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Code promo appliqué !</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          {appliedDiscount.name} - Réduction de {appliedDiscount.discount_value}
                          {appliedDiscount.discount_type === 'percentage' ? '%' : ` ${priceCalculations?.currency}`}
                        </p>
                      </div>
                    )}
                    
                    {actionData?.type === 'discount' && !actionData.success && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Code promo invalide</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          {actionData.message}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Section droite - Résumé (2/5) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Résumé de la commande */}
                <Card className="border-0 shadow-lg sticky top-6">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ShoppingCart className="h-5 w-5 text-brand-purple" />
                      Résumé de la commande
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Produit */}
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {product.product.product_image ? (
                          <img 
                            src={product.product.product_image.trim()} 
                            alt={product.product.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {product.product.product_name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {product.product.category} • {product.product.product_type}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      {/* Prix de base */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prix de base:</span>
                        <div className="text-right">
                          <div className="font-medium">
                            {priceCalculations.displayPrice}
                          </div>
                          {priceCalculations.hasPromoPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              {priceCalculations.originalPrice}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Réduction appliquée */}
                      {appliedDiscount && priceCalculations.discountAmount > 0 && (
                        <div className="flex items-center justify-between text-green-600">
                          <span className="text-sm">Réduction:</span>
                          <span className="font-medium">
                            -{priceCalculations.discountAmount} {priceCalculations.currency}
                          </span>
                        </div>
                      )}

                      {/* Prix flexible */}
                      {priceCalculations.isFlexiblePrice && priceCalculations.priceRange && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-medium text-blue-800 mb-1">
                            Prix flexible
                          </div>
                          <div className="text-sm text-blue-600">
                            Fourchette: {priceCalculations.priceRange.min} - {priceCalculations.priceRange.max}
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">Total:</span>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">
                              {priceCalculations.finalPrice} {priceCalculations.currency}
                            </div>
                            {priceCalculations.savingsPercentage > 0 && (
                              <div className="text-sm text-green-600 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                Économie de {priceCalculations.savingsPercentage}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bouton de commande */}
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={!isFormValid || isCreatingTransaction || isLoadingCountries}
                      className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-brand-purple to-brand-gold hover:from-brand-purple/90 hover:to-brand-gold/90 transition-all duration-300"
                    >
                      {isCreatingTransaction ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Traitement en cours...
                        </div>
                      ) : isLoadingCountries ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Chargement des pays...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Finaliser la commande
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Moyens de paiement */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5 text-brand-gold" />
                      Moyens de paiement acceptés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.name}
                          className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30"
                        >
                          <img
                            src={method.icon}
                            alt={method.name}
                            className="w-8 h-8 object-contain"
                          />
                          <div>
                            <div className="text-sm font-medium">{method.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Garanties */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span>Paiement 100% sécurisé</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <span>Livraison instantanée</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                        <span>Support client 24/7</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}