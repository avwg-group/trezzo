import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Layout } from "~/components/Layout"
import { ProductCarousel } from "~/components/ProductCarousel"
import { ProductGrid } from "~/components/ProductGrid"
import { SearchBar } from "~/components/SearchBar"
import { TrustBanner } from "~/components/TrustBanner"
import type { Product } from "~/services/types"
import { ErrorPageVariants } from './ErrorPage';

interface HomePageProps {
  loaderData: {
    featuredProducts: Product[];
    allProducts: Product[];
    shop: any;
    pagination: any;
    error?: string;
  };
}

export function HomePage({ loaderData }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { featuredProducts, allProducts, shop, error } = loaderData

  // Filtrage des produits côté client pour la recherche en temps réel
  const filteredProducts = allProducts.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Afficher une erreur si le chargement a échoué
  if (error) {
    return (
      <ErrorPageVariants.NotFound 
        error={error}
        message="Impossible de charger la boutique. Vérifiez l'URL ou votre connexion internet."
      />
    );
  }

  return (
    <Layout shop_name={shop?.name} logo_url={shop?.logo_url}>


      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {shop?.name || 'Des produits digitaux, disponibles instantanément.'}
            </h1>
            <p className="text-lg text-muted-foreground mb-8" dangerouslySetInnerHTML={{
              __html: shop?.description || 'Sélection de produits numériques de qualité, téléchargeables immédiatement après achat.'
            }} />
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
      {featuredProducts.length > 0 && (
        <ProductCarousel 
          products={featuredProducts.map(product => ({
            id: product.id,
            slug: product.slug,
            name: product.product_name,
            price: `${product.price}`,
            originalPrice: product.promo_price ? `${product.promo_price}` : undefined,
            image: product.product_image,
            category: product.category
          }))}
          title="Produits phares"
        />
      )}

      {/* Section tous les produits avec pagination */}
      <ProductGrid 
        products={filteredProducts.map(product => ({
          id: product.id,
          slug: product.slug,
          name: product.product_name,
          price: `${product.price}`,
          originalPrice: product.promo_price ? `${product.promo_price}` : undefined,
          image: product.product_image,
          category: product.category
        }))}
        title="Tous nos produits"
        productsPerPage={8}
      />

      {/* Bannière de confiance */}
      <TrustBanner />
    </Layout>
  )
}