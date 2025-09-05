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

    console.log('🔍 Loading products with filters:', filters);
    const response = await ProductService.getProducts(filters);
    
    // Récupérer plus de produits pour les catégories (limite raisonnable)
    let uniqueCategories: string[] = [];
    try {
      const categoriesResponse = await ProductService.getProducts({ 
        limit: 100, // Limite raisonnable au lieu de 1000
        page: 1 
      });
      uniqueCategories = Array.from(
        new Set(categoriesResponse.products.map(p => p.category).filter(Boolean))
      ).sort();
    } catch (categoriesError) {
      console.warn('⚠️ Could not fetch categories, using current products:', categoriesError);
      // Fallback : utiliser les catégories des produits actuels
      uniqueCategories = Array.from(
        new Set(response.products.map(p => p.category).filter(Boolean))
      ).sort();
    }
    
    return {
      products: response.products || [],
      pagination: response.pagination || null,
      shop: response.shop || null,
      categories: uniqueCategories,
      filters,
      error: null
    };
  } catch (error) {
    console.error('❌ Loader error:', error);
    
    return {
      products: [],
      pagination: null,
      shop: null,
      categories: [],
      filters: {
        page: 1,
        limit: 12,
        category: '',
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc' as const
      },
      error: error instanceof Error ? error.message : 'Erreur de chargement des produits'
    };
  }
}

// Optimisation de l'hydratation
clientLoader.hydrate = true as const;

// Fallback premium pendant le chargement
export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-4 animate-pulse"></div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1 animate-pulse"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 animate-pulse"></div>
          </div>
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading indicator */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">Chargement des produits...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsRoute({ loaderData }: Route.ComponentProps) {
  return <ProductsPage loaderData={loaderData} />;
}