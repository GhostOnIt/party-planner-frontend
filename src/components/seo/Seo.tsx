import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const FALLBACK_SITE_URL = 'https://www.party-planner.cg';
const DEFAULT_OG_IMAGE = '/logo.png';

function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return FALLBACK_SITE_URL;
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getSiteUrl();
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export interface SeoProps {
  /** Title affiché dans l'onglet et dans les balises og/twitter. Si absent, le titre par défaut du site est utilisé. */
  title?: string;
  /** Description courte (~155 caractères max recommandé). */
  description?: string;
  /** Chemin canonique relatif (ex. "/login"). Par défaut : pathname courant. */
  canonicalPath?: string;
  /** Image absolue ou chemin relatif depuis la racine du site (ex. "/og/landing.jpg"). */
  image?: string;
  /** Si true, ajoute meta robots noindex,nofollow (pages privées/à jeton). */
  noindex?: boolean;
  /** "website" par défaut, "article" pour pages de contenu (légal, etc.). */
  ogType?: 'website' | 'article';
}

export function Seo({
  title,
  description,
  canonicalPath,
  image,
  noindex = false,
  ogType = 'website',
}: SeoProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const htmlLang = (i18n.language || 'fr').split('-')[0];

  const siteName = t('app.name', 'Party Planner');
  const defaultTitle = t('seo.default.title', { defaultValue: 'Party Planner — Plateforme des organisateurs d\'événements' });
  const defaultDescription = t('seo.default.description', {
    defaultValue:
      "Party Planner est la plateforme pensée pour les organisateurs d'événements : agences et indépendants. Gérez vos événements, invités, budgets et devis au même endroit.",
  });

  const finalTitle = title ? `${title} — ${siteName}` : defaultTitle;
  const finalDescription = description ?? defaultDescription;
  const finalCanonical = toAbsoluteUrl(canonicalPath ?? location.pathname);
  const finalImage = toAbsoluteUrl(image ?? DEFAULT_OG_IMAGE);
  const robotsContent = noindex ? 'noindex,nofollow' : 'index,follow';

  return (
    <Helmet htmlAttributes={{ lang: htmlLang }}>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
}
