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

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage loaderData={loaderData} />;
}