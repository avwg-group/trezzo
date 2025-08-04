import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Layout } from "~/components/Layout"
import { ProductCarousel } from "~/components/ProductCarousel"
import { ProductGrid } from "~/components/ProductGrid"
import { SearchBar } from "~/components/SearchBar"
import { TrustBanner } from "~/components/TrustBanner"

// Données d'exemple pour les produits phares
const featuredProducts = [
  {
    id: 1,
    name: "Template E-commerce Premium",
    price: "49€",
    originalPrice: "79€",
    promoEndDate: "2025-10-28T23:59:59", // Updated to future date
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=300&h=200&fit=crop",
    category: "Templates"
  },
  {
    id: 2,
    name: "Pack d'icônes UI/UX",
    price: "29€",
    image: "/api/placeholder/300/200",
    category: "Icônes"
  },
  {
    id: 3,
    name: "Guide Marketing Digital",
    price: "19€",
    originalPrice: "35€",
    promoEndDate: "2025-02-15T23:59:59", // Updated to future date
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
    category: "Guides"
  },
  {
    id: 4,
    name: "Preset Lightroom Pro",
    price: "39€",
    image: "/api/placeholder/300/200",
    category: "Presets"
  },
  {
    id: 5,
    name: "Template Blog Moderne",
    price: "35€",
    originalPrice: "55€",
    promoEndDate: "2025-02-20T23:59:59", // Updated to future date
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&h=200&fit=crop",
    category: "Templates"
  },
  {
    id: 6,
    name: "Pack Illustrations",
    price: "25€",
    image: "/api/placeholder/300/200",
    category: "Icônes"
  }
]

// Tous les produits pour la section avec pagination
const allProducts = Array.from({ length: 24 }, (_, i) => ({
  id: i + 7,
  name: `Produit Digital ${i + 1}`,
  price: `${19 + (i % 5) * 10}€`,
  originalPrice: i % 3 === 0 ? `${29 + (i % 5) * 10}€` : undefined,
  promoEndDate: i % 3 === 0 ? `2025-02-${Math.min(28, 15 + (i % 10))}T23:59:59` : undefined, // Updated to future dates
  image: "/api/placeholder/300/200",
  category: ["Templates", "Icônes", "Guides", "Presets"][i % 4]
}))

export function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrage des produits
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Des produits digitaux, disponibles instantanément.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Découvrez notre sélection de produits numériques de qualité, téléchargeables immédiatement après achat.
            </p>
            <Button size="lg" asChild>
              <a href="#products">Voir les produits</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Barre de recherche */}
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
      />

      {/* Produits phares avec Carousel */}
      <ProductCarousel 
        products={featuredProducts}
        title="Produits phares"
      />

      {/* Section tous les produits avec pagination */}
      <ProductGrid 
        products={filteredProducts}
        title="Tous nos produits"
        productsPerPage={8}
      />

      {/* Bannière de confiance */}
      <TrustBanner />
    </Layout>
  )
}