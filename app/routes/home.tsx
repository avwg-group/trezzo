import { HomePage } from "~/pages/HomePage"
import type { Route } from "./+types/home"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trezzo - Produits digitaux instantanés" },
    { name: "description", content: "Des produits digitaux, disponibles instantanément." },
  ]
}

export default function Home() {
  return <HomePage />
}