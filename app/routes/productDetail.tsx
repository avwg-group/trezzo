import type { Route } from "./+types/productDetail";
import { ProductService } from "~/services/productService";
import { ProductDetailPage } from "~/pages/ProductDetailPage";
import { ErrorPageVariants } from "~/pages/ErrorPage";

export async function loader({
  params,
  request,
}: Route.LoaderArgs) {
  try {
    const { slug } = params;
    
    if (!slug) {
      throw new Error('Slug du produit manquant');
    }

    // Détection basique des crawlers sociaux pour éviter les erreurs de tenant/API
    const userAgent = request.headers.get("user-agent") || "";
    const isSocialCrawler = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot|Googlebot|bingbot/i.test(userAgent);
    const host = request.headers.get("host") || "";

    const url = new URL(request.url);
    const reviewsPage = parseInt(url.searchParams.get('reviews_page') || '1');
    const reviewsLimit = parseInt(url.searchParams.get('reviews_limit') || '10');

    console.log('🔍 SSR Loading product details for slug:', slug, 'UA:', userAgent);
    
    // Passer la requête pour le contexte tenant en SSR
    const response = await ProductService.getProductDetails(slug, reviewsPage, reviewsLimit, request);
    
    return {
      product: response.product,
      customFields: response.custom_fields,
      faqItems: response.faq_items,
      reviews: response.reviews,
      shop: response.shop,
      error: null
    };
  } catch (error) {
    console.error('❌ SSR Product detail loader error:', error);
    
    // Si c'est un crawler social et qu'on a une erreur, essayer de retourner des données minimales
    // pour éviter "Produit non trouvé" si possible (dépend de ce qu'on peut récupérer)
    // Ici on retourne l'erreur mais on va gérer l'affichage meta plus bas
    
    return {
      product: null,
      customFields: [],
      faqItems: [],
      reviews: null,
      shop: null,
      error: error instanceof Error ? error.message : 'Erreur de chargement du produit'
    };
  }
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  try {
    const { slug } = params;
    
    if (!slug) {
      throw new Error('Slug du produit manquant');
    }

    const url = new URL(request.url);
    const reviewsPage = parseInt(url.searchParams.get('reviews_page') || '1');
    const reviewsLimit = parseInt(url.searchParams.get('reviews_limit') || '10');

    console.log('🔍 Loading product details for slug:', slug);
    const response = await ProductService.getProductDetails(slug, reviewsPage, reviewsLimit);
    
    return {
      product: response.product,
      customFields: response.custom_fields,
      faqItems: response.faq_items,
      reviews: response.reviews,
      shop: response.shop,
      error: null
    };
  } catch (error) {
    console.error('❌ Product detail loader error:', error);
    
    return {
      product: null,
      customFields: [],
      faqItems: [],
      reviews: null,
      shop: null,
      error: error instanceof Error ? error.message : 'Erreur de chargement du produit'
    };
  }
}

// Optimisation de l'hydratation
clientLoader.hydrate = true as const;

// Fallback pendant le chargement
export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image skeleton */}
          <div className="lg:col-span-2">
            <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
          
          {/* Price skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse mb-4"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Loading indicator */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">Chargement du produit...</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export function meta({ data, location }: Route.MetaArgs) {
  const { product, shop, error } = data || {};
  console.log("detailproduct meta:", product ? "Found" : "Not Found", error);
  
  // Si erreur ou pas de produit, ne rien retourner (ou retourner des tags vides)
  // pour éviter "Produit non trouvé" qui est moche sur les réseaux sociaux.
  // Les réseaux sociaux utiliseront peut-être le cache ou le titre par défaut du site.
  if (error || !product || !shop) {
    return [];
  }

  const productName = product.product_name;
  const shopName = shop.name;
  const description = product.description ? product.description.substring(0, 160) : `Découvrez ${productName} sur ${shopName}`;
  
  // Build canonical URL
  const baseUrl = shop.custom_domain 
    ? `https://${shop.custom_domain}`
    : `https://${shop.slug}.myzestylinks.com`;
  const canonicalUrl = `${baseUrl}${location.pathname}`;

  // Image handling - ensure absolute URL
  const rawImage = product.product_image || shop.logo_url;
  const ogImage = rawImage 
    ? (rawImage.startsWith('http') ? rawImage : `${baseUrl}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`)
    : `${baseUrl}/og-default.jpg`; // Fallback to a default public image if needed

  return [
    { title: `${productName} - ${shopName}` },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    
    // Open Graph / Facebook / WhatsApp
    { property: "og:type", content: "product" },
    { property: "og:site_name", content: shopName },
    { property: "og:title", content: productName },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:price:amount", content: product.promo_price || product.price },
    { property: "og:price:currency", content: shop.currency || "XAF" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: productName },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    { property: "twitter:image:alt", content: productName },

    // Favicon & Canonical
    { tagName: "link", rel: "icon", type: "image/x-icon", href: ogImage }, 
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    
    // Schema.org Product
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productName,
        "description": description,
        "image": ogImage,
        "url": canonicalUrl,
        "offers": {
          "@type": "Offer",
          "price": product.promo_price || product.price,
          "priceCurrency": shop.currency || "XAF",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": shopName
          }
        }
      }
    }
  ];
}
export default function ProductDetailRoute({ loaderData }: Route.ComponentProps) {
  // Gestion des erreurs
  if (loaderData.error) {
    return (
      <ErrorPageVariants.NotFound 
        error={loaderData.error}
        message="Produit introuvable. Vérifiez l'URL ou retournez à la boutique."
      />
    );
  }

  return <ProductDetailPage loaderData={loaderData} />;
}