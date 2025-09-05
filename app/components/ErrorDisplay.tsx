import { AlertCircle, RefreshCw, Wifi, Server, Shield, Clock } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import type { ApiClientError } from '~/lib/apiClient';

interface ErrorDisplayProps {
  error: ApiClientError | Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  const getErrorInfo = () => {
    if (typeof error === 'string') {
      return {
        title: 'Erreur',
        message: error,
        icon: AlertCircle,
        variant: 'destructive' as const
      };
    }

    if (error instanceof Error && 'status' in error) {
      const apiError = error as ApiClientError;
      
      switch (apiError.code) {
        case 'NETWORK_ERROR':
          return {
            title: 'Problème de connexion',
            message: apiError.message,
            icon: Wifi,
            variant: 'destructive' as const
          };
        case 'UNAUTHORIZED':
          return {
            title: 'Accès non autorisé',
            message: apiError.message,
            icon: Shield,
            variant: 'destructive' as const
          };
        case 'NOT_FOUND':
          return {
            title: 'Ressource introuvable',
            message: apiError.message,
            icon: AlertCircle,
            variant: 'default' as const
          };
        case 'RATE_LIMIT':
          return {
            title: 'Limite de requêtes atteinte',
            message: apiError.message,
            icon: Clock,
            variant: 'default' as const
          };
        case 'SERVER_ERROR':
        case 'INTERNAL_ERROR':
        case 'BAD_GATEWAY':
        case 'SERVICE_UNAVAILABLE':
          return {
            title: 'Problème serveur',
            message: apiError.message,
            icon: Server,
            variant: 'destructive' as const
          };
        default:
          return {
            title: `Erreur ${apiError.status}`,
            message: apiError.message,
            icon: AlertCircle,
            variant: 'destructive' as const
          };
      }
    }

    return {
      title: 'Erreur inattendue',
      message: error.message || 'Une erreur inattendue s\'est produite',
      icon: AlertCircle,
      variant: 'destructive' as const
    };
  };

  const { title, message, icon: Icon, variant } = getErrorInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert variant={variant}>
        <Icon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      
      {onRetry && (
        <div className="flex justify-center">
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      )}
    </div>
  );
}