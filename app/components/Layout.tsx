import { Navbar } from "~/components/Navbar"
import { Footer } from "~/components/Footer"

interface LayoutProps {
  children: React.ReactNode
  shop_name?: string
  logo_url?: string;
}

export function Layout({ children, shop_name, logo_url }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar shop_name={shop_name} logo_url={logo_url} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}