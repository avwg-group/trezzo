import { Button } from "~/components/ui/button";
import { AlertCircle, RefreshCw, Home, ExternalLink, Zap, Shield, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

interface ErrorPageProps {
  title?: string;
  message?: string;
  error?: string;
  showRetry?: boolean;
  showHome?: boolean;
  showZestyLinks?: boolean;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'premium' | 'minimal';
}

export function ErrorPage({
  title = "Une erreur s'est produite",
  message = "Nous rencontrons des difficultés techniques. Veuillez réessayer plus tard.",
  error,
  showRetry = true,
  showHome = true,
  showZestyLinks = true,
  onRetry,
  className = "",
  variant = 'premium'
}: ErrorPageProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleZestyLinks = () => {
    window.open('https://zestylinks.com', '_blank');
  };

  if (variant === 'premium') {
    return (
      <div className={`h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-hidden ${className}`}>
        {/* Animated Background Elements - Optimized */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-4 flex items-center justify-center h-full">
          <div className="max-w-xl mx-auto text-center">
            {/* Compact Premium Error Icon */}
                    <div className="mb-4">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                    </div>

            {/* Compact Premium Title */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3 leading-tight">
              {title}
            </h1>

            {/* Compact Premium Message */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-4">
              <p className="text-base text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                {message}
              </p>
              
              {/* Compact ZestyLinks Promotion */}
              {showZestyLinks && (
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg p-3 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Propulsé par ZestyLinks</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    La plateforme révolutionnaire qui permet aux entrepreneurs africains de monétiser leurs créations digitales.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 mr-1 text-green-500" />
                      <span>Sécurisé</span>
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
                      <span>IA Intégrée</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-blue-500" />
                      <span>Ultra-Rapide</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compact Error Details */}
            {error && (
              <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-700/50 rounded-lg p-3 mb-4">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">Détails techniques</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all bg-red-100/50 dark:bg-red-900/30 rounded p-2">
                  {error}
                </p>
              </div>
            )}

            {/* Compact Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mb-4">
              {showRetry && (
                <Button 
                  onClick={handleRetry} 
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-1 group-hover:rotate-180 transition-transform duration-500" />
                  Réessayer
                </Button>
              )}

              {showZestyLinks && (
                <Button 
                  onClick={handleZestyLinks} 
                  className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform duration-300" />
                  ZestyLinks
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              )}
            </div>

            {/* Compact Footer */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center">
                Propulsé par 
                <button 
                  onClick={handleZestyLinks}
                  className="ml-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 flex items-center group"
                >
                  ZestyLinks
                  <Sparkles className="w-3 h-3 ml-1 group-hover:animate-spin" />
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback compact design for other variants
  return (
    <div className={`container mx-auto px-4 py-8 text-center h-screen flex items-center justify-center ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-base text-muted-foreground mb-4">{message}</p>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-destructive font-mono break-all">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {showRetry && (
            <Button onClick={handleRetry} className="flex items-center gap-2" size="sm">
              <RefreshCw className="w-4 h-4" />Réessayer
            </Button>
          )}
          {showHome && (
            <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2" size="sm">
              <Home className="w-4 h-4" />Accueil
            </Button>
          )}
          {showZestyLinks && (
            <Button onClick={handleZestyLinks} variant="secondary" className="flex items-center gap-2" size="sm">
              <ExternalLink className="w-4 h-4" />ZestyLinks
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Variantes prédéfinies compactes
export const ErrorPageVariants = {
  DataLoading: (props: Partial<ErrorPageProps>) => (
    <ErrorPage
      title="Chargement..."
      message="Préparation de vos données avec notre IA révolutionnaire !"
      variant="premium"
      {...props}
    />
  ),

  NotFound: (props: Partial<ErrorPageProps>) => (
    <ErrorPage
      title="Page Introuvable"
      message="Cette page semble avoir pris des vacances ! Découvrez nos solutions e-commerce."
      showRetry={false}
      variant="premium"
      {...props}
    />
  ),

  Network: (props: Partial<ErrorPageProps>) => (
    <ErrorPage
      title="Connexion Interrompue"
      message="Connexion instable. Découvrez comment ZestyLinks révolutionne le e-commerce !"
      variant="premium"
      {...props}
    />
  ),

  Server: (props: Partial<ErrorPageProps>) => (
    <ErrorPage
      title="Maintenance"
      message="Mise à jour en cours pour une expérience encore plus exceptionnelle !"
      variant="premium"
      {...props}
    />
  ),

  ZestyLinksPremium: (props: Partial<ErrorPageProps>) => (
    <ErrorPage
      title="Petit pépin technique"
      message="Même les meilleures technologies ont parfois besoin d'une pause !"
      variant="premium"
      showZestyLinks={true} 
      {...props}
    />
  )
};