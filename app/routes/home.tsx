import type { Route } from "./+types/home";
import { ProductService } from "~/services";
import { HomePage } from "~/pages/HomePage";

export async function clientLoader({
  request,
}: Route.ClientLoaderArgs) {
  try {
    // Récupérer les produits phares (première page avec limite élevée)
    const productsResponse = await ProductService.getProducts({
      page: 1,
      limit: 20,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    
    return {
      featuredProducts: productsResponse.products.slice(0, 6), // Les 6 premiers pour le carousel
      allProducts: productsResponse.products,
      shop: productsResponse.shop,
      pagination: productsResponse.pagination
    };
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
    // Retourner des données par défaut en cas d'erreur
    return {
      featuredProducts: [],
      allProducts: [],
      shop: null,
      pagination: null,
      error: 'Impossible de charger les produits'
    };
  }
}

// Forcer l'hydratation côté client pour une meilleure UX
clientLoader.hydrate = true as const;

// Fallback pendant le chargement
export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Chargement des produits...</p>
      </div>
    </div>
  );
}



// Fonction meta pour le SEO dynamique
export function meta({ data }: Route.MetaArgs) {
  const shop = data?.shop;
  const featuredProducts = data?.featuredProducts || [];
  
  // Données par défaut si pas de boutique
  const defaultTitle = "MyZestylinks";
  const defaultDescription = "MyZestylinks - Your trusted online marketplace for quality products and secure transactions";
  
  // Construire le titre et la description
  const title = shop ? `${shop.name}` : defaultTitle;
  const description = shop 
    ? `${shop.description || `Découvrez ${shop.name}, votre boutique en ligne de confiance.`} Livraison rapide et paiement sécurisé.`
    : defaultDescription;
  
  // URL canonique
  const canonicalUrl = shop?.custom_domain 
    ? `https://${shop.custom_domain}`
    : `https://${shop?.slug}.myzestylinks.com` || "";
  
  // Image de la boutique (logo ou premier produit)
  const ogImage = shop?.logo_url || "default-logo.png";
  
  // Mots-clés basés sur les catégories des produits
  const categories = [...new Set(featuredProducts.map(p => p.category))].join(", ");
  const keywords = shop 
    ? `${shop.name}, boutique en ligne, ${categories}, ${shop.currency}, livraison`
    : "boutique en ligne, e-commerce, produits";

  return [
    // Balises SEO de base
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "author", content: shop?.name || "ZestyLinks" },
    { name: "robots", content: "index, follow" },
    // Favicon
    { tagName: "link", rel: "icon", type: "image/x-icon", href: ogImage },
    // Balises canoniques
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    
    // Open Graph pour WhatsApp, Facebook, etc.
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: title },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:locale", content: "fr_FR" },
    
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    
    // WhatsApp spécifique (utilise Open Graph)
    { property: "og:image:alt", content: `Logo de ${shop?.name || 'la boutique'}` },
    
    // Balises e-commerce
    { name: "product:price:currency", content: shop?.currency || "XAF" },
    { name: "product:availability", content: "in stock" },
    
    // Geographic tags for African countries
    [
      { name: "geo.region", content: "AF" },
      { name: "geo.country", content: "Africa" },
      { name: "geo.countries", content: "Cameroon, Chad, Central African Republic, Republic of the Congo, Equatorial Guinea, Gabon, Benin, Burkina Faso, Ivory Coast, Guinea-Bissau, Mali, Niger, Senegal, Togo" },
    ],
    
    // Schema.org JSON-LD pour le référencement
    {
      tagName: "script",
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Store",
        "name": title,
        "description": description,
        "url": canonicalUrl,
        "logo": ogImage,
        "image": ogImage,
        "currenciesAccepted": shop?.currency || "XAF",
        "paymentAccepted": "Mobile Money, Carte bancaire",
        "priceRange": featuredProducts.length > 0 
          ? `${Math.min(...featuredProducts.map(p => p.price))} - ${Math.max(...featuredProducts.map(p => p.price))} ${shop?.currency || 'XAF'}`
          : undefined,
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Catalogue produits",
          "itemListElement": featuredProducts.slice(0, 3).map((product, index) => ({
            "@type": "Offer",
            "position": index + 1,
            "itemOffered": {
              "@type": "Product",
              "name": product.product_name,
              "description": product.description,
              "image": product.product_image,
              "offers": {
                "@type": "Offer",
                "price": product.promo_price || product.price,
                "priceCurrency": shop?.currency || "XAF",
                "availability": "https://schema.org/InStock"
              }
            }
          }))
        }
      })
    }
  ];
}



export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage loaderData={loaderData} />;
}