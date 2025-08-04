import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { ProductCard } from "./ProductCard"

interface Product {
  id: number
  name: string
  price: string
  originalPrice?: string
  promoEndDate?: string
  image: string
  category: string
}

interface ProductCarouselProps {
  products: Product[]
  title: string
}

export function ProductCarousel({ products, title }: ProductCarouselProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          {title}
        </h2>
        
        {/* Carousel pour mobile et tablette */}
        <div className="block lg:hidden">
          <Carousel className="w-full max-w-xs sm:max-w-sm mx-auto">
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem key={product.id} >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-4" />
            <CarouselNext className="mr-4" />
          </Carousel>
        </div>

        {/* Grille pour desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}