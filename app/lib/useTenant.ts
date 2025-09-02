import { useEffect, useState } from 'react';

export interface TenantInfo {
  subdomain: string | null;
  domain: string;
  fullDomain: string;
  tenantId: string;
}

export function useTenant(): TenantInfo {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    subdomain: null,
    domain: '',
    fullDomain: '',
    tenantId: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      let subdomain: string | null = null;
      let domain: string;
      let tenantId: string;

      // Gérer différents cas : localhost, sous-domaine.domain.com, domain.com
      if (hostname === 'localhost' || hostname.startsWith('127.0.0.1') || hostname.startsWith('192.168')) {
        // Environnement de développement
        domain = hostname;
        tenantId = 'default';
      } else if (parts.length > 2) {
        // Cas avec sous-domaine : tenant.example.com
        subdomain = parts[0];
        domain = parts.slice(1).join('.');
        tenantId = subdomain;
      } else {
        // Cas sans sous-domaine : example.com
        domain = hostname;
        tenantId = domain.replace(/\./g, '-'); // Remplacer les points par des tirets
      }

      setTenantInfo({
        subdomain,
        domain,
        fullDomain: hostname,
        tenantId
      });
    }
  }, []);

  return tenantInfo;
}