import { apiClient, type ApiClientError } from '~/lib/apiClient';
import type { Product, ProductsResponse, ProductFilters, ProductDetailsResponse, CreateTransactionResponse, CreateTransactionRequest, DiscountResponse, Discount } from './types';
import LocationService from './locationService';

export class ProductService {
  // Méthode pour récupérer la devise depuis le cache
  static async getUserCurrency(): Promise<string | null> {
    try {
      const locationData = await LocationService.getLocationData();
      return locationData?.currency || null;
    } catch (error) {
      console.error('❌ Error getting user currency:', error);
      return null;
    }
  }

  static async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder);
      
      // Récupérer et ajouter la devise de l'utilisateur
      const currency = await this.getUserCurrency();
      if (currency) {
        params.append('currency', currency);
      }
      
      const queryString = params.toString();
      const endpoint = `/shop/client/products${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching products from: getProducts', endpoint);
      
      const response = await apiClient.get<ProductsResponse>(endpoint);
      console.log('✅ Products fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error; // Relancer l'erreur pour que le loader puisse la gérer
    }
  }

  static async getProductDetails(
    slug: string, 
    reviewsPage: number = 1, 
    reviewsLimit: number = 10
  ): Promise<ProductDetailsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (reviewsPage) params.append('reviews_page', reviewsPage.toString());
      if (reviewsLimit) params.append('reviews_limit', reviewsLimit.toString());
      
      // Ajouter la devise de l'utilisateur
      const currency = await this.getUserCurrency();
      if (currency) {
        params.append('currency', currency);
      }
      
      const queryString = params.toString();
      const endpoint = `/shop/client/product/${slug}${queryString ? `?${queryString}` : ''}`;
      console.log('🔍 Fetching product details from:', endpoint);
      
      const response = await apiClient.get<ProductDetailsResponse>(endpoint);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching product details for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Nettoie le prix en retirant la devise si elle est présente
   * @param price - Prix qui peut contenir une devise (ex: "100 FCFA" ou 100)
   * @returns Montant numérique sans devise
   */
  private static cleanPrice(price: string | number): number {
    if (typeof price === 'number') {
      return price;
    }
    
    // Retirer les devises communes et les espaces
    const cleanedPrice = price
      .toString()
      .replace(/[^0-9.,]/g, '') // Garder seulement les chiffres, virgules et points
      .replace(/,/g, '.'); // Remplacer les virgules par des points
    
    const numericPrice = parseFloat(cleanedPrice);
    
    if (isNaN(numericPrice)) {
      throw new Error(`Prix invalide: ${price}`);
    }
    
    return numericPrice;
  }

  /**
   * Crée une transaction de paiement avec les données de géolocalisation automatiques
   * @param clientData - Données du client
   * @param productData - Données du produit
   * @returns Réponse de création de transaction avec URL de paiement
   */
  static async createTransaction(
    clientData: {
      client_name: string;
      email: string;
      phone: string;
    },
    productData: {
      product_id: string;
      shop_id: string;
      amount: string | number; // Prix qui peut contenir une devise
    }
  ): Promise<CreateTransactionResponse> {
    try {
      // Validation des données client
      if (!clientData.client_name || !clientData.email || !clientData.phone) {
        throw new Error('Les informations client sont obligatoires');
      }
      
      // Validation des données produit
      if (!productData.shop_id || !productData.product_id) {
        throw new Error('Les identifiants shop et produit sont obligatoires');
      }
      
      // Nettoyer le prix (retirer la devise si présente)
      const cleanAmount = this.cleanPrice(productData.amount);
      
      if (cleanAmount <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
      }
      
      // Récupérer les données de géolocalisation depuis le cache
      const locationData = await LocationService.getLocationData();
      
      if (!locationData) {
        throw new Error('Impossible de récupérer les données de géolocalisation');
      }
      
      // Construire la requête de transaction
      const transactionRequest: CreateTransactionRequest = {
        client_name: clientData.client_name,
        email: clientData.email,
        phone: clientData.phone,
        country: locationData.country_name,
        city: locationData.city,
        type: 'purchase',
        currency: locationData.currency,
        amount: cleanAmount, // Montant nettoyé sans devise
        shop_id: productData.shop_id,
        product_id: productData.product_id
      };
      
      console.log('🔍 Creating transaction with geolocation data:', {
        ...transactionRequest,
        amount: `${transactionRequest.amount} (nettoyé)`,
        location: `${transactionRequest.city}, ${transactionRequest.country}`,
        currency: transactionRequest.currency
      });
      
      const response = await apiClient.post<CreateTransactionResponse>(
        '/api/v1/transactions/',
        transactionRequest
      );
      
      console.log('✅ Transaction created successfully:', {
        transaction_id: response.transaction_id,
        payment_url: response.payment_url,
        amount: response.amount,
        currency: response.currency
      });
      
      return response;
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Méthode alternative pour créer une transaction avec données manuelles
   * (si on veut bypasser la géolocalisation)
   */
  static async createTransactionManual(transactionData: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    try {
      // Validation des données
      if (!transactionData.client_name || !transactionData.email || !transactionData.phone) {
        throw new Error('Les informations client sont obligatoires');
      }
      
      if (!transactionData.shop_id || !transactionData.product_id) {
        throw new Error('Les identifiants shop et produit sont obligatoires');
      }
      
      if (!transactionData.amount || transactionData.amount <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
      }
      
      // S'assurer que le type est 'purchase'
      transactionData.type = 'purchase';
      
      console.log('🔍 Creating manual transaction:', transactionData);
      
      const response = await apiClient.post<CreateTransactionResponse>(
        '/api/v1/transactions/',
        transactionData
      );
      
      console.log('✅ Manual transaction created successfully:', response.transaction_id);
      
      return response;
    } catch (error) {
      console.error('❌ Error creating manual transaction:', error);
      throw error;
    }
  }

  /**
   * Récupère une réduction par code et ID de boutique
   * @param shopId - L'ID de la boutique
   * @param discountCode - Le code de réduction
   * @returns Promise<DiscountResponse> - Les données de la réduction
   */
  async getDiscountByCode(shopId: string, discountCode: string): Promise<DiscountResponse> {
    try {
      const response = await apiClient.get<DiscountResponse>(
        `/discounts/shop/${shopId}/code/${discountCode}`
      );
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la réduction:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une réduction est valide et applicable
   * @param discount - Les données de la réduction
   * @returns boolean - True si la réduction est valide
   */
  isDiscountValid(discount: Discount): boolean {
    const now = new Date();
    const startDate = new Date(discount.starts_at);
    const endDate = new Date(discount.ends_at);
    
    return (
      discount.status === 'active' &&
      discount.is_valid &&
      now >= startDate &&
      now <= endDate &&
      discount.current_uses < discount.max_uses
    );
  }

  /**
   * Calcule le montant de réduction à appliquer
   * @param discount - Les données de la réduction
   * @param originalAmount - Le montant original
   * @returns number - Le montant de la réduction
   */
  calculateDiscountAmount(discount: Discount, originalAmount: number): number {
    if (!this.isDiscountValid(discount)) {
      return 0;
    }

    const discountValue = parseFloat(discount.discount_value);
    
    if (discount.discount_type === 'percentage') {
      return (originalAmount * discountValue) / 100;
    } else if (discount.discount_type === 'fixed_amount') {
      return Math.min(discountValue, originalAmount); // Ne peut pas dépasser le montant original
    }
    
    return 0;
  }

  /**
   * Applique une réduction à un montant
   * @param discount - Les données de la réduction
   * @param originalAmount - Le montant original
   * @returns object - Contient le montant original, la réduction et le montant final
   */
  applyDiscount(discount: Discount, originalAmount: number) {
    const discountAmount = this.calculateDiscountAmount(discount, originalAmount);
    const finalAmount = originalAmount - discountAmount;
    
    return {
      originalAmount,
      discountAmount,
      finalAmount,
      discountApplied: discountAmount > 0,
      discountDetails: {
        code: discount.code,
        name: discount.name,
        type: discount.discount_type,
        value: discount.discount_value
      }
    };
  }
}





