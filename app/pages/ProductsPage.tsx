import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Layout } from "~/components/Layout"
import { ProductCard } from "~/components/ProductCard"
import { Search, ChevronLeft, ChevronRight, Check, ChevronsUpDown, Package } from "lucide-react"
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
import type { Product, Pagination } from "~/services/types"
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { ErrorPageVariants } from './ErrorPage';

interface ProductsPageProps {
  loaderData: {
    products: Product[];
    pagination: Pagination | null;
    shop: any;
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

const categories = [
  { label: "Tous", value: "" },
  { label: "Templates", value: "Templates" },
  { label: "Icônes", value: "Icônes" },
  { label: "Guides", value: "Guides" },
  { label: "Presets", value: "Presets" },
]

export function ProductsPage({ loaderData }: ProductsPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(loaderData.filters.search)
  const [selectedCategory, setSelectedCategory] = useState(loaderData.filters.category)
  const [open, setOpen] = useState(false)

  const { products, pagination, shop, filters, error } = loaderData

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
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Gestion du changement de catégorie
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    updateFilters({ category, page: 1 })
  }

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    updateFilters({ page })
  }

  const selectedCategoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || "Tous"

  // Dans le composant ProductsPage, remplacer la section d'erreur par :
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay 
            error={error} 
            onRetry={() => window.location.reload()}
            className="max-w-md mx-auto"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {shop?.name ? `Produits de ${shop.name}` : 'Tous nos produits'}
          </h1>
          
          {/* Filtres et recherche */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher un produit..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Combobox pour les catégories */}
            <div className="w-full lg:w-[200px]">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedCategoryLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher une catégorie..." />
                    <CommandList>
                      <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.value}
                            value={category.label}
                            onSelect={() => {
                              handleCategoryChange(category.value)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategory === category.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {category.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Grille de produits ou message vide */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.product_name,
                    price: `${product.price}€`,
                    originalPrice: product.promo_price ? `${product.promo_price}€` : undefined,
                    image: product.product_image,
                    category: product.category
                  }} 
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                  <Button 
                    key={page}
                    variant={pagination.current_page === page ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Résultats */}
            {pagination && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Affichage de {((pagination.current_page - 1) * pagination.items_per_page) + 1} à {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} sur {pagination.total_items} produits
              </div>
            )}
          </>
        ) : (
          /* Message quand aucun produit n'est trouvé */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchTerm || selectedCategory ? (
                <>Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou votre terme de recherche.</>
              ) : (
                <>Il n'y a actuellement aucun produit disponible dans cette catégorie.</>
              )}
            </p>
            {(searchTerm || selectedCategory) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("")
                  updateFilters({ search: "", category: "", page: 1 })
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}