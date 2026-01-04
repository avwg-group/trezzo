import type { Route } from "./+types/home";
import { ProductService } from "~/services";
import { HomePage } from "~/pages/HomePage";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const productsResponse = await ProductService.getProducts({
      page: 1,
      limit: 20,
      sortBy: 'created_at',
      sortOrder: 'desc'
    }, request);
    return {
      featuredProducts: productsResponse.products.slice(0, 6),
      allProducts: productsResponse.products,
      shop: productsResponse.shop,
      pagination: productsResponse.pagination
    };
  } catch (error) {
    console.error('Erreur lors du chargement des produits (server):', error);
    return {
      featuredProducts: [],
      allProducts: [],
      shop: null,
      pagination: null,
      error: 'Impossible de charger les produits'
    };
  }
}

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



export function meta({ data, location }: Route.MetaArgs) {
  const shop = data?.shop;
  const featuredProducts = data?.featuredProducts || [];
  const baseUrl = shop?.custom_domain ? `https://${shop.custom_domain}` : (shop?.slug ? `https://${shop.slug}.myzestylinks.com` : undefined);
  const canonicalUrl = baseUrl ? `${baseUrl}${location.pathname}` : undefined;

  const title = shop?.name;
  const description = shop?.description ? `${shop.description} Livraison rapide et paiement sécurisé.` : undefined;

  // Image: backend priorité, sinon fallback public
  const primaryImage = featuredProducts[0]?.product_image || shop?.logo_url || '/og-home.jpg';
  const ogImage = primaryImage.startsWith('http') ? primaryImage : (baseUrl ? `${baseUrl}${primaryImage.startsWith('/') ? primaryImage : `/${primaryImage}`}` : primaryImage);

  const categories = [...new Set(featuredProducts.map(p => p.category))].filter(Boolean).join(", ");
  const keywords = title && shop?.currency ? `${title}, boutique en ligne, ${categories}, ${shop.currency}, livraison` : undefined;

  const tags = [
    ...(title ? [{ title }] : []),
    ...(description ? [{ name: "description", content: description }] : []),
    ...(keywords ? [{ name: "keywords", content: keywords }] : []),
    ...(title ? [{ name: "author", content: title }] : []),
    { name: "robots", content: "index, follow" },
    ...(canonicalUrl ? [{ tagName: "link", rel: "canonical", href: canonicalUrl }] : []),
    ...(ogImage ? [{ tagName: "link", rel: "icon", type: "image/x-icon", href: ogImage }] : []),
    { property: "og:type", content: "website" },
    ...(title ? [{ property: "og:site_name", content: title }] : []),
    ...(title ? [{ property: "og:title", content: title }] : []),
    ...(description ? [{ property: "og:description", content: description }] : []),
    ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
    ...(ogImage ? [{ property: "og:image:width", content: "1200" }] : []),
    ...(ogImage ? [{ property: "og:image:height", content: "630" }] : []),
    ...(canonicalUrl ? [{ property: "og:url", content: canonicalUrl }] : []),
    { property: "og:locale", content: "fr_FR" },
    ...(ogImage && ogImage.startsWith('https') ? [{ property: "og:image:secure_url", content: ogImage }] : []),
    ...(title ? [{ name: "twitter:title", content: title }] : []),
    ...(description ? [{ name: "twitter:description", content: description }] : []),
    ...(ogImage ? [{ name: "twitter:card", content: "summary_large_image" }, { name: "twitter:image", content: ogImage }] : []),
    ...(title ? [{ property: "og:image:alt", content: `${title}` }] : []),
    {
      tagName: "script",
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Store",
        ...(title ? { name: title } : {}),
        ...(description ? { description } : {}),
        url: canonicalUrl,
        logo: ogImage,
        image: ogImage,
        currenciesAccepted: shop?.currency,
        paymentAccepted: "Mobile Money, Carte bancaire",
        priceRange: featuredProducts.length > 0 && shop?.currency
          ? `${Math.min(...featuredProducts.map(p => p.price))} - ${Math.max(...featuredProducts.map(p => p.price))} ${shop.currency}`
          : undefined,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Catalogue produits",
          itemListElement: featuredProducts.slice(0, 3).map((product, index) => ({
            "@type": "Offer",
            position: index + 1,
            itemOffered: {
              "@type": "Product",
              name: product.product_name,
              description: product.description,
              image: product.product_image,
              offers: {
                "@type": "Offer",
                price: product.promo_price || product.price,
                priceCurrency: shop?.currency,
                availability: "https://schema.org/InStock"
              }
            }
          }))
        }
      })
    }
  ];

  return tags;
}



export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage loaderData={loaderData} />;
}