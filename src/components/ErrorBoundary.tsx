import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console with full details
    console.error('='.repeat(50));
    console.error('REACT ERROR BOUNDARY CAUGHT AN ERROR');
    console.error('='.repeat(50));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('='.repeat(50));

    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
          <Card className="w-full max-w-lg border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                Une erreur est survenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Nous sommes desoles, quelque chose s'est mal passe. Veuillez reessayer ou retourner a l'accueil.
              </p>

              <div className="rounded-lg bg-destructive/10 p-3 font-mono text-sm text-destructive">
                {this.state.error?.message || 'Erreur inconnue'}
              </div>

              {this.state.error?.stack && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Voir les details techniques
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={this.handleReset} variant="default" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reessayer
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Retour a l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
