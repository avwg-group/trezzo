export interface LocationData {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

class LocationService {
  private static readonly STORAGE_KEY = 'user_location_data';
  private static readonly CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes
  private static readonly API_URL = 'https://ipapi.co/json/';

  /**
   * Récupère les données de localisation depuis le cache ou l'API
   */
  static async getLocationData(): Promise<LocationData | null> {
    try {
      // Vérifier d'abord le cache
      const cachedData = this.getCachedLocationData();
      if (cachedData) {
        return cachedData;
      }

      // Si pas de cache, récupérer depuis l'API
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const locationData: LocationData = await response.json();
      
      // Stocker dans le cache
      this.setCachedLocationData(locationData);
      
      return locationData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de localisation:', error);
      return null;
    }
  }

  /**
   * Récupère les données depuis le localStorage si elles sont valides
   */
  private static getCachedLocationData(): LocationData | null {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Vérifier si le cache n'a pas expiré
      if (now - timestamp < this.CACHE_DURATION) {
        return data;
      }

      // Cache expiré, le supprimer
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    } catch (error) {
      console.error('Erreur lors de la lecture du cache:', error);
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  /**
   * Stocke les données dans le localStorage avec un timestamp
   */
  private static setCachedLocationData(data: LocationData): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  /**
   * Force le rafraîchissement des données (supprime le cache et récupère de nouvelles données)
   */
  static async refreshLocationData(): Promise<LocationData | null> {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.getLocationData();
  }

  /**
   * Supprime les données du cache
   */
  static clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Vérifie si des données sont disponibles dans le cache
   */
  static hasCachedData(): boolean {
    return this.getCachedLocationData() !== null;
  }

  /**
   * Récupère uniquement le pays de l'utilisateur
   */
  static async getUserCountry(): Promise<string | null> {
    const locationData = await this.getLocationData();
    return locationData?.country_code || null;
  }

  /**
   * Récupère uniquement la devise de l'utilisateur
   */
  static async getUserCurrency(): Promise<string | null> {
    const locationData = await this.getLocationData();
    return locationData?.currency || null;
  }

  /**
   * Récupère uniquement le fuseau horaire de l'utilisateur
   */
  static async getUserTimezone(): Promise<string | null> {
    const locationData = await this.getLocationData();
    return locationData?.timezone || null;
  }
}

export default LocationService;