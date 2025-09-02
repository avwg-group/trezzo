import React, { createContext, useContext, type ReactNode } from 'react';
import { useTenant, type TenantInfo } from './useTenant';

interface TenantContextType {
  tenant: TenantInfo;
  getHeaders: () => Record<string, string>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const tenant = useTenant();

  const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'X-Tenant-Domain': tenant.fullDomain,
      'X-Tenant-ID': tenant.tenantId,
    };

    if (tenant.subdomain) {
      headers['X-Tenant-Subdomain'] = tenant.subdomain;
    }

    return headers;
  };

  return (
    <TenantContext.Provider value={{ tenant, getHeaders }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}