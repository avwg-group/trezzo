import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { type TenantInfo } from './useTenant';

export interface ApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private tenantHeaders: Record<string, string> = {};

  constructor(options: ApiClientOptions = {}) {
    this.axiosInstance = axios.create({
      baseURL: options.baseUrl || '/api',
      timeout: options.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...options.defaultHeaders
      }
    });

    // Intercepteur pour ajouter automatiquement les headers du tenant
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Fusionner les headers du tenant avec les headers de la requête
        Object.entries(this.tenantHeaders).forEach(([key, value]) => {
          config.headers.set(key, value);
        });
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les réponses et erreurs globalement
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Gestion centralisée des erreurs
        if (error.response) {
          // Le serveur a répondu avec un code d'erreur
          const message = error.response.data?.message || error.response.statusText || 'Erreur serveur';
          throw new Error(`API Error ${error.response.status}: ${message}`);
        } else if (error.request) {
          // La requête a été faite mais pas de réponse
          throw new Error('Erreur réseau: Aucune réponse du serveur');
        } else {
          // Erreur lors de la configuration de la requête
          throw new Error(`Erreur de configuration: ${error.message}`);
        }
      }
    );
  }

  setTenantInfo(tenant: TenantInfo) {
    this.tenantHeaders = {
      'X-Tenant-Domain': tenant.fullDomain,
      'X-Tenant-ID': tenant.tenantId,
    };

    if (tenant.subdomain) {
      this.tenantHeaders['X-Tenant-Subdomain'] = tenant.subdomain;
    }
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
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
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