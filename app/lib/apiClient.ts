import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import { type TenantInfo } from './useTenant';

// Types pour la gestion d'erreurs
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export class ApiClientError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiClientOptions {
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}
 const baseUrl = "http://127.0.0.1:8380/api/v1";

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private tenantHeaders: Record<string, string> = {};

  constructor(options: ApiClientOptions = {}) {
    console.log("baseUrl",baseUrl);
    
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: options.timeout || 20000,
      headers: {
        'Content-Type': 'application/json',
        ...options.defaultHeaders
      }
    });

    // Intercepteur pour ajouter automatiquement les headers du tenant
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('🔍 DEBUG - Headers avant ajout tenant:', config.headers);
        console.log('🔍 DEBUG - Tenant headers disponibles:', this.tenantHeaders);
        
        // Ajouter chaque header du tenant
        for (const [key, value] of Object.entries(this.tenantHeaders)) {
          console.log(`🔍 DEBUG - Ajout header: ${key} = ${value}`);
          config.headers[key] = value;
        }
        
        console.log('🔍 DEBUG - Headers après ajout tenant:', config.headers);
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Intercepteur pour gérer les réponses et erreurs globalement
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiClientError {
    console.error('🚨 API Error:', error);

    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const status = error.response.status;
      const data = error.response.data as any;
      
      let message: string;
      let code: string | undefined;
      let details: any;

      switch (status) {
        case 400:
          message = data?.message || 'Les données fournies sont incorrectes. Veuillez vérifier votre saisie.';
          code = 'BAD_REQUEST';
          break;
        case 401:
          message = 'Votre session a expiré. Veuillez vous reconnecter pour continuer.';
          code = 'UNAUTHORIZED';
          break;
        case 403:
          message = 'Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.';
          code = 'FORBIDDEN';
          break;
        case 404:
          message = data?.message || 'Cette ressource n\'existe pas ou n\'est plus disponible.';
          code = 'NOT_FOUND';
          break;
        case 409:
          message = data?.message || 'Un conflit est survenu. Cette ressource existe déjà dans notre système.';
          code = 'CONFLICT';
          break;
        case 422:
          message = 'Les données soumises ne respectent pas le format attendu.';
          code = 'VALIDATION_ERROR';
          details = data?.errors || data?.details;
          break;
        case 429:
          message = 'Vous avez effectué trop de requêtes. Merci de patienter quelques instants avant de réessayer.';
          code = 'RATE_LIMIT';
          break;
        case 500:
          message = 'Une erreur technique est survenue. Notre équipe a été notifiée et travaille sur le problème.';
          code = 'INTERNAL_ERROR';
          break;
        case 502:
          message = 'Le service est momentanément inaccessible. Merci de réessayer dans quelques instants.';
          code = 'BAD_GATEWAY';
          break;
        case 503:
          message = 'Le service est en cours de maintenance. Nous serons de retour très prochainement.';
          code = 'SERVICE_UNAVAILABLE';
          break;
        default:
          message = data?.message || error.response.statusText || `Une erreur inattendue est survenue (${status})`;
          code = 'SERVER_ERROR';
      }

      return new ApiClientError(message, status, code, details);
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      return new ApiClientError(
        'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
        0,
        'NETWORK_ERROR'
      );
    } else {
      // Erreur lors de la configuration de la requête
      return new ApiClientError(
        `Erreur de configuration: ${error.message}`,
        0,
        'CONFIG_ERROR'
      );
    }
  }

  setTenantInfo(tenant: TenantInfo) {
    console.log('🔍 DEBUG - setTenantInfo appelé avec:', tenant);
    
    this.tenantHeaders = {
      'X-Tenant-Domain': tenant.fullDomain,
      'X-Tenant-ID': tenant.tenantId,
    };

    if (tenant.subdomain) {
      this.tenantHeaders['X-Tenant-Subdomain'] = tenant.subdomain;
    }
    
    console.log('🔍 DEBUG - Tenant headers configurés:', this.tenantHeaders);
  }

  // Méthode pour obtenir les headers actuels (utile pour le debug)
  getTenantHeaders(): Record<string, string> {
    return { ...this.tenantHeaders };
  }

  // Méthode pour configurer des headers globaux supplémentaires
  setGlobalHeaders(headers: Record<string, string>) {
    Object.assign(this.axiosInstance.defaults.headers.common, headers);
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      throw error; // L'erreur est déjà traitée par l'intercepteur
    }
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Méthode pour faire des requêtes avec upload de fichiers
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await this.axiosInstance.post<T>(endpoint, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    });
    return response.data;
  }

  // Méthode pour annuler des requêtes
  createCancelToken() {
    return axios.CancelToken.source();
  }

  // Méthode pour vérifier si une erreur est due à une annulation
  isCancel(error: any): boolean {
    return axios.isCancel(error);
  }

  // Accès direct à l'instance axios pour des cas avancés
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Instance globale du client API
export const apiClient = new ApiClient();

// Types utiles pour TypeScript
export type { AxiosRequestConfig, AxiosResponse } from 'axios';