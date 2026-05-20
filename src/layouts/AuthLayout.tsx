import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen bg-muted/50">
      <Link
        to="/"
        className="absolute left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-primary lg:left-6 lg:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('auth.backToHome')}
      </Link>
      <Outlet />
    </div>
  );
}
