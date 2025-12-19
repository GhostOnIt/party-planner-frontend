import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">{t('errors.notFound')}</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
          {t('errors.notFoundDescription', 'La page que vous recherchez n\'existe pas ou a ete deplacee.')}
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/dashboard" className="gap-2">
              <Home className="h-4 w-4" />
              {t('nav.dashboard')}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('errors.goBack')}
          </Button>
        </div>
      </div>
    </div>
  );
}
