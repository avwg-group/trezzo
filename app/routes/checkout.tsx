import type { Route } from "./+types/checkout";
import { ProductService } from "~/services/productService";
import { CheckoutPage } from "~/pages/CheckoutPage";
import { redirect } from "react-router";
import LocationService from "~/services/locationService";

// Interface pour les données du checkout
interface CheckoutLoaderData {
  product: any;
  shop: any;
  locationData: any;
  error: string | null;
}

// Client Loader - Récupère les données du produit et de géolocalisation
export async function clientLoader({
  request,
}: Route.ClientLoaderArgs): Promise<CheckoutLoaderData> {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname; // e.g. "/tester-de-prix/checkout"
    const productSlug = pathname.split('/')[1]; // Get "tester-de-prix" dynamically
    console.log("Product slug from pathname : ", productSlug);
    
    if (!productSlug) {
      throw new Error('Slug du produit manquant');
    }

    console.log('🔍 Loading checkout data for product:', productSlug);
    
    // Récupérer les données en parallèle
    const [productResponse, locationData] = await Promise.all([
      ProductService.getProductDetails(productSlug),
      LocationService.getLocationData()
    ]);

    return {
      product: productResponse,
      shop: productResponse?.shop || { name: 'Boutique', logo_url: null }, // Récupérer depuis le produit
      locationData,
      error: null
    };
  } catch (error) {
    console.error('❌ Checkout loader error:', error);
    
    return {
      product: null,
      shop: null,
      locationData: null,
      error: error instanceof Error ? error.message : 'Erreur de chargement'
    };
  }
}

// Client Action - Gère la soumission du formulaire et les actions
export async function clientAction({
  request,
}: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const actionType = formData.get('actionType') as string;

    switch (actionType) {
      case 'applyDiscount': {
        const shopId = formData.get('shopId') as string;
        const discountCode = formData.get('discountCode') as string;
        
        console.log('🏷️ Applying discount:', { shopId, discountCode });
        
        if (!shopId || !discountCode) {
          return {
            type: 'discount',
            success: false,
            discount: null,
            message: 'Données manquantes pour appliquer la réduction'
          };
        }
        
        try {
          const discountResponse = await ProductService.getDiscountByCode(shopId, discountCode);
          
          // Vérifier si la réduction est valide
          if (discountResponse.success && discountResponse.data) {
            const isValid = ProductService.isDiscountValid(discountResponse.data);
            
            if (!isValid) {
              return {
                type: 'discount',
                success: false,
                discount: null,
                message: 'Ce code de réduction n\'est plus valide ou a expiré'
              };
            }
          }
          
          return {
            type: 'discount',
            success: discountResponse.success,
            discount: discountResponse.data,
            message: discountResponse.success ? 'Réduction appliquée avec succès!' : 'Code de réduction invalide'
          };
        } catch (error: any) {
          console.error('❌ Error applying discount:', error);
          
          // Gestion des erreurs spécifiques
          let errorMessage = 'Erreur lors de l\'application de la réduction';
          
          if (error.status === 404) {
            errorMessage = 'Code de réduction introuvable';
          } else if (error.status === 400) {
            errorMessage = 'Code de réduction invalide';
          } else if (error.status >= 500) {
            errorMessage = 'Erreur serveur, veuillez réessayer';
          }
          
          return {
            type: 'discount',
            success: false,
            discount: null,
            message: errorMessage
          };
        }
      }
      
      case 'createTransaction': {
        const clientData = {
          client_name: formData.get('fullName') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
        };
        
        const productData = {
          product_id: formData.get('productSlug') as string,
          shop_id: formData.get('shopId') as string,
          amount: parseFloat(formData.get('amount') as string)
        };
        
        console.log('💳 Creating transaction:', { clientData, productData });
        
        const transactionResponse = await ProductService.createTransaction(clientData, productData);
        
        // Rediriger vers l'URL de paiement
        if (transactionResponse.payment_url) {
          return redirect(transactionResponse.payment_url);
        }
        
        return {
          type: 'transaction',
          success: true,
          transaction: transactionResponse,
          message: 'Transaction créée avec succès!'
        };
      }
      
      default:
        throw new Error('Action non reconnue');
    }
  } catch (error) {
    console.error('❌ Checkout action error:', error);
    
    return {
      type: 'error',
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors du traitement'
    };
  }
}

// Optimisation de l'hydratation
clientLoader.hydrate = true as const;

// Fallback pendant le chargement
export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Préparation de votre commande...</p>
      </div>
    </div>
  );
}

export default function Checkout({ loaderData, actionData }: Route.ComponentProps) {
  return <CheckoutPage loaderData={loaderData} actionData={actionData} />;
}