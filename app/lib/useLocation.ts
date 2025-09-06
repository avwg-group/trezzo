import { useState, useEffect } from 'react';
import LocationService, { type LocationData } from '../services/locationService';

interface UseLocationReturn {
  locationData: LocationData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useLocation = (): UseLocationReturn => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocationService.getLocationData();
      setLocationData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    const data = await LocationService.refreshLocationData();
    setLocationData(data);
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  return {
    locationData,
    loading,
    error,
    refresh
  };
};

// Hook pour récupérer uniquement le pays
export const useUserCountry = () => {
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LocationService.getUserCountry().then((countryCode) => {
      setCountry(countryCode);
      setLoading(false);
    });
  }, []);

  return { country, loading };
};

// Hook pour récupérer uniquement la devise
export const useUserCurrency = () => {
  const [currency, setCurrency] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LocationService.getUserCurrency().then((currencyCode) => {
      setCurrency(currencyCode);
      setLoading(false);
    });
  }, []);

  return { currency, loading };
};