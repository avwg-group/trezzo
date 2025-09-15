import { apiClient } from '../lib/apiClient';

export interface Pixel {
  id: string;
  shop_id: string;
  platform: 'facebook' | 'google' | 'tiktok';
  pixel_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  tracking_events: string[];
  custom_code: string;
  created_at: string;
  updated_at: string;
}

export interface PixelsResponse {
  success: boolean;
  message_key: string;
  error_code: string | null;
  data: {
    pixels: Pixel[];
  };
}

export class PixelService {
  static async getShopPixels(): Promise<Pixel[]> {
    try {
      const response = await apiClient.get<PixelsResponse>('/pixels/shop/client');
      return response.data.pixels.filter(pixel => pixel.is_active);
    } catch (error) {
      console.error('Erreur lors de la récupération des pixels:', error);
      return [];
    }
  }

  static async getFacebookPixels(): Promise<Pixel[]> {
    const pixels = await this.getShopPixels();
    return pixels.filter(pixel => pixel.platform === 'facebook');
  }

  // Méthode utile pour le tracking manuel
  static trackEvent(eventName: string, parameters?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName, parameters);
    }
  }

  // Méthode pour tracker les conversions
  static trackPurchase(value: number, currency: string = 'XAF') {
    this.trackEvent('Purchase', { value, currency });
  }
}