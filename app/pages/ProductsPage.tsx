import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Layout } from "~/components/Layout"
import { ProductCard } from "~/components/ProductCard"
import { Search, ChevronLeft, ChevronRight, Check, ChevronsUpDown, Package, Filter, SortAsc, SortDesc, Grid3X3, List } from "lucide-react"
import { cn } from "~/lib/utils"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import type { Product, Pagination } from "~/services/types"
import { ErrorPageVariants } from './ErrorPage';

interface ProductsPageProps {
  loaderData: {
    products: Product[];
    pagination: Pagination | null;
    shop: any;
    categories: string[];
    filters: {
      page: number;
      limit: number;
      category: string;
      search: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    };
    error?: string;
  };
}

const sortOptions = [
  { label: "Plus récents", value: "created_at", order: "desc" },
  { label: "Plus anciens", value: "created_at", order: "asc" },
  { label: "Prix croissant", value: "price", order: "asc" },
  { label: "Prix décroissant", value: "price", order: "desc" },
  { label: "Nom A-Z", value: "product_name", order: "asc" },
  { label: "Nom Z-A", value: "product_name", order: "desc" },
  { label: "Mieux notés", value: "average_rating", order: "desc" },
]

export function ProductsPage({ loaderData }: ProductsPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(loaderData.filters.search)
  const [selectedCategory, setSelectedCategory] = useState(loaderData.filters.category)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryOpen, setCategoryOpen] = useState(false)

  const { products, pagination, shop, categories, filters, error } = loaderData

  // Préparer les catégories avec compteurs
  const categoriesWithCount = useMemo(() => {
    const allCategory = { label: "Toutes les catégories", value: "", count: products.length }
    const categoryList = categories.map(cat => ({
      label: cat,
      value: cat,
      count: products.filter(p => p.category === cat).length
    }))
    return [allCategory, ...categoryList]
  }, [categories, products])

  // Fonction pour mettre à jour les paramètres d'URL
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams)
    
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value && value !== '' && value !== 1) {
        params.set(key, value.toString())
      } else if (key !== 'page' && key !== 'limit') {
        params.delete(key)
      }
    })
    
    navigate(`?${params.toString()}`, { replace: true })
  }

  // Gestion de la recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        updateFilters({ search: searchTerm, page: 1 })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters.search])

  // Gestion du changement de catégorie
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    updateFilters({ category, page: 1 })
  }

  // Gestion du tri
  const handleSortChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split('-')
    updateFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc', page: 1 })
  }

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    updateFilters({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectedCategoryLabel = categoriesWithCount.find(cat => cat.value === selectedCategory)?.label || "Toutes les catégories"

  // Gestion des erreurs
  if (error) {
    return (
      <Layout logo_url={shop?.logo_url} shop_name={shop?.name}>
        <ErrorPageVariants.DataLoading 
          title="Erreur de chargement"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </Layout>
    )
  }

  return (
    <Layout logo_url={shop?.logo_url} shop_name={shop?.name}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header simple */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {shop?.name || 'Boutique'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Barre de recherche mobile-first */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Rechercher un produit..." 
                className="pl-10 h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres et tri - Layout mobile-first */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Catégories */}
            <div className="flex-1">
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full justify-between h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center truncate">
                      <Filter className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{selectedCategoryLabel}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <Command>
                    <CommandInput placeholder="Rechercher une catégorie..." />
                    <CommandList>
                      <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
                      <CommandGroup>
                        {categoriesWithCount.map((category) => (
                          <CommandItem
                            key={category.value}
                            value={category.label}
                            onSelect={() => {
                              handleCategoryChange(category.value)
                              setCategoryOpen(false)
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCategory === category.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {category.label}
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {category.count}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Tri */}
            <div className="flex-1">
              <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={handleSortChange}>
                <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    {filters.sortOrder === 'asc' ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
                    <SelectValue placeholder="Trier par" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {sortOptions.map((option) => (
                    <SelectItem key={`${option.value}-${option.order}`} value={`${option.value}-${option.order}`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Mode d'affichage */}
            <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Résultats */}
          {products.length > 0 ? (
            <>
              {/* Grille de produits - Mobile-first responsive */}
              <div className={cn(
                "mb-8",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                  : "space-y-4"
              )}>
                {products.map((product) => (
                  <div key={product.id} className={cn(
                    "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200",
                    viewMode === 'list' && "flex flex-row"
                  )}>
                    <ProductCard 
                      product={{
                        id: product.id,
                        name: product.product_name,
                        price: `${product.price}€`,
                        originalPrice: product.promo_price ? `${product.promo_price}€` : undefined,
                        image: product.product_image,
                        category: product.category,
                        rating: product.average_rating,
                        reviewCount: product.review_count
                      }} 
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination simple */}
              {pagination && pagination.total_pages > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                      {((pagination.current_page - 1) * pagination.items_per_page) + 1} - {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} sur {pagination.total_items}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={!pagination.has_prev}
                        className="h-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
                        const page = pagination.current_page <= 3 
                          ? i + 1 
                          : pagination.current_page + i - 2
                        
                        if (page > pagination.total_pages) return null
                        
                        return (
                          <Button 
                            key={page}
                            variant={pagination.current_page === page ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="h-8 min-w-[32px]"
                          >
                            {page}
                          </Button>
                        )
                      })}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={!pagination.has_next}
                        className="h-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Message simple quand aucun produit */
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {searchTerm || selectedCategory ? (
                    <>Aucun produit ne correspond à vos critères de recherche.</>
                  ) : (
                    <>Il n'y a actuellement aucun produit disponible.</>
                  )}
                </p>
                {(searchTerm || selectedCategory) && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("")
                      updateFilters({ search: "", category: "", page: 1 })
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}