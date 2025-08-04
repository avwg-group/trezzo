import { Shield, Download, Mail } from "lucide-react"

export function TrustBanner() {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Paiement sécurisé</h3>
            <p className="text-sm text-muted-foreground">Transactions protégées et cryptées</p>
          </div>
          <div className="flex flex-col items-center">
            <Mail className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Envoi automatique</h3>
            <p className="text-sm text-muted-foreground">Réception immédiate par email</p>
          </div>
          <div className="flex flex-col items-center">
            <Download className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Téléchargement immédiat</h3>
            <p className="text-sm text-muted-foreground">Accès instantané à vos achats</p>
          </div>
        </div>
      </div>
    </section>
  )
}