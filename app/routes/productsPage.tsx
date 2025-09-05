import type { Route } from "./+types/productsPage";
import { ProductService } from "~/services/productService";
import type { ApiClientError } from "~/lib/apiClient";
import { ProductsPage } from "~/pages/ProductsPage";

export async function clientLoader({
  request,
}: Route.ClientLoaderArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    };

    const response = await ProductService.getProducts(filters);
    
    return {
      products: response.products || [],
      pagination: response.pagination || null,
      shop: response.shop || null,
      filters,
      error: null
    };
  } catch (error) {
    console.error('❌ Loader error:', error);
    
    // Retourner les données d'erreur au lieu de lancer l'exception
    return {
      products: [],
      pagination: null,
      shop: null,
      filters: {
        page: 1,
        limit: 12,
        category: '',
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc' as const
      },
      error: error instanceof Error ? error : new Error('Erreur de chargement')
    };
  }
}

// Forcer l'hydratation côté client
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

export default function ProductsRoute({ loaderData }: Route.ComponentProps) {
  return <ProductsPage loaderData={loaderData} />;
}