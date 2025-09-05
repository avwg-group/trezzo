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
  const [sortOpen, setSortOpen] = useState(false)

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

  // Gestion de la recherche avec debounce optimisé
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        updateFilters({ search: searchTerm, page: 1 })
      }
    }, 300) // Réduit à 300ms pour une meilleure réactivité

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

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
  const currentSortOption = sortOptions.find(opt => opt.value === filters.sortBy && opt.order === filters.sortOrder)

  // Gestion des erreurs avec page d'erreur premium
  if (error) {
    return (
      <Layout>
        <ErrorPageVariants.DataLoading 
          title="Erreur de chargement"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Premium */}
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                {shop?.name ? `${shop.name}` : 'Boutique'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Découvrez notre collection de {products.length} produits premium
              </p>
              
              {/* Barre de recherche et filtres premium */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Recherche */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input 
                    placeholder="Rechercher un produit..." 
                    className="pl-12 h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 rounded-xl shadow-sm focus:shadow-md transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Catégories */}
                <div className="w-full lg:w-[250px]">
                  <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryOpen}
                        className="w-full justify-between h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          {selectedCategoryLabel}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
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
                                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
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
                <div className="w-full lg:w-[200px]">
                  <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={handleSortChange}>
                    <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center">
                        {filters.sortOrder === 'asc' ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
                        <SelectValue placeholder="Trier par" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
                      {sortOptions.map((option) => (
                        <SelectItem key={`${option.value}-${option.order}`} value={`${option.value}-${option.order}`}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Mode d'affichage */}
                <div className="flex bg-white/50 dark:bg-slate-700/50 rounded-xl p-1 shadow-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          {products.length > 0 ? (
            <>
              {/* Grille de produits */}
              <div className={cn(
                "mb-8",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-4"
              )}>
                {products.map((product) => (
                  <div key={product.id} className={cn(
                    "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]",
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

              {/* Pagination Premium */}
              {pagination && pagination.total_pages > 1 && (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Affichage de {((pagination.current_page - 1) * pagination.items_per_page) + 1} à {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} sur {pagination.total_items} produits
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={!pagination.has_prev}
                        className="rounded-lg"
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
                            className="rounded-lg min-w-[40px]"
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
                        className="rounded-lg"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Message premium quand aucun produit n'est trouvé */
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/20 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Package className="h-12 w-12 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Aucun produit trouvé</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {searchTerm || selectedCategory ? (
                    <>Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres.</>
                  ) : (
                    <>Il n'y a actuellement aucun produit disponible dans cette boutique.</>
                  )}
                </p>
                {(searchTerm || selectedCategory) && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("")
                      updateFilters({ search: "", category: "", page: 1 })
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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