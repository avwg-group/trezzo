import type { Route } from "./+types/productDetail";
import { ProductService } from "~/services/productService";
import { ProductDetailPage } from "~/pages/ProductDetailPage";
import { ErrorPageVariants } from "~/pages/ErrorPage";

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
  console.log("detailproduct",product);
  
  if (error || !product || !shop) {
    return [
      { title: "Produit non trouvé" },
      { name: "description", content: "Le produit demandé n'a pas pu être trouvé" },
      { name: "robots", content: "noindex, nofollow" }
    ];
  }

  const productName = product.product_name || "Produit";
  const shopName = shop.name || "Boutique";
  const description = product.description || `Découvrez ${productName} sur ${shopName}`;
  const productImage = product.product_image || shop.logo_url || "default-logo.png";

  // Build canonical URL
  const canonicalUrl = shop.custom_domain 
    ? `https://${shop.custom_domain}${location.pathname}`
    : `https://${shop.slug}.myzestylinks.com${location.pathname}`;

  return [
    { title: `${productName} - ${shopName}` },
    { name: "description", content: description.substring(0, 160) },
    { name: "robots", content: "index, follow" },
    
    // Open Graph basic tags
    { property: "og:title", content: `${productName} - ${shopName}` },
    { property: "og:description", content: description.substring(0, 160) },
    { property: "og:type", content: "product" },
    { property: "og:image", content: productImage },
    { property: "og:url", content: canonicalUrl },
    
    // Basic Schema.org
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productName,
        "description": description,
        "image": productImage,
        "url": canonicalUrl
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