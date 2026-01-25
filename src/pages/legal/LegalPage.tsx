import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Loader2, FileWarning } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLegalPage } from '@/hooks/useLegalPages';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useLegalPage(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
            <FileWarning className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Page non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            La page que vous recherchez n'existe pas ou n'est pas disponible.
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Party Planner" className="h-8 w-8" />
              <span className="text-lg font-semibold text-foreground">Party Planner</span>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {page.title}
          </h1>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 pb-8 border-b">
            <Calendar className="h-4 w-4" />
            <span>
              Dernière mise à jour :{' '}
              {format(new Date(page.updated_at), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>

          {/* Content */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:text-foreground
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-ul:my-4 prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </motion.article>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Party Planner" className="h-6 w-6" />
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Party Planner. Tous droits réservés.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/legal/terms"
                className={`text-muted-foreground hover:text-foreground transition-colors ${
                  slug === 'terms' ? 'text-foreground font-medium' : ''
                }`}
              >
                Conditions d'utilisation
              </Link>
              <Link
                to="/legal/privacy"
                className={`text-muted-foreground hover:text-foreground transition-colors ${
                  slug === 'privacy' ? 'text-foreground font-medium' : ''
                }`}
              >
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
