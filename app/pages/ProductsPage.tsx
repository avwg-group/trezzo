import { useState } from "react"
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

// Données d'exemple pour tous les produits avec promotions
const allProducts = Array.from({ length: 24 }, (_, i) => {
  const hasPromo = i % 3 === 0 // Un produit sur trois en promo
  const basePrice = 19 + (i % 5) * 10
  
  return {
    id: i + 1,
    name: `Produit Digital ${i + 1}`,
    price: `${basePrice}€`,
    originalPrice: hasPromo ? `${basePrice + 20}€` : undefined,
    promoEndDate: hasPromo ? "2025-12-31T23:59:59" : undefined,
    image: "/api/placeholder/300/200",
    category: ["Templates", "Icônes", "Guides", "Presets"][i % 4]
  }
})

const PRODUCTS_PER_PAGE = 8

const categories = [
  { label: "Tous", value: "" },
  { label: "Templates", value: "Templates" },
  { label: "Icônes", value: "Icônes" },
  { label: "Guides", value: "Guides" },
  { label: "Presets", value: "Presets" },
]

export function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [open, setOpen] = useState(false)

  // Filtrage des produits
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)

  const selectedCategoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || "Tous"

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Tous nos produits</h1>
          
          {/* Filtres et recherche */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher un produit..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
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
                              setSelectedCategory(category.value)
                              setCurrentPage(1)
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
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button 
                    key={page}
                    variant={currentPage === page ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Résultats */}
            <div className="text-center text-sm text-muted-foreground mt-4">
              Affichage de {startIndex + 1} à {Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length)} sur {filteredProducts.length} produits
            </div>
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
                  setCurrentPage(1)
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