
import { ProductsPage } from "~/pages/ProductsPage"
import type { Route } from "./+types/productsPage"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export default function ProductsRouter() {
  return <ProductsPage />
}