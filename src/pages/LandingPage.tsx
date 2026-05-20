import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Calendar,
  Users,
  Wallet,
  ListChecks,
  ScanLine,
  FileText,
  Sparkles,
  PartyPopper,
  Star,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Seo } from '@/components/seo';
import { FestiveHero, Confetti } from '@/components/festive';
import { useAuthStore } from '@/stores/authStore';
import logo from '@/assets/logo.png';
import heroBg from '@/assets/video-1.jpg';

const SITE_URL = (import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') ?? 'https://www.party-planner.cg');

interface Feature {
  key: 'events' | 'guests' | 'budget' | 'tasks' | 'checkin' | 'quotes';
  Icon: typeof Calendar;
}

const FEATURES: Feature[] = [
  { key: 'events', Icon: Calendar },
  { key: 'guests', Icon: Users },
  { key: 'budget', Icon: Wallet },
  { key: 'tasks', Icon: ListChecks },
  { key: 'checkin', Icon: ScanLine },
  { key: 'quotes', Icon: FileText },
];

// Couleurs d'avatar par testimonial — initiales sur fond coloré (pas de photos placeholder)
const TESTIMONIALS = [
  { key: 't1', accent: 'from-[#4F46E5] to-[#7C3AED]' },
  { key: 't2', accent: 'from-[#10B981] to-[#34D399]' },
  { key: 't3', accent: 'from-[#E91E8C] to-[#F472B6]' },
] as const;

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Party Planner',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Party Planner',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: ['fr', 'en'],
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function LandingPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Seo
        title={t('seo.landing.title')}
        description={t('seo.landing.description')}
        canonicalPath="/"
      />
      <JsonLd />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Party Planner" className="h-9 w-9" />
              <span className="text-lg font-bold">Party Planner</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                {t('landing.nav.features')}
              </a>
              <Link to="/plans" className="hover:text-foreground transition-colors">
                {t('landing.nav.pricing')}
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="sm" className="gap-2">
                    {t('landing.nav.dashboard')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      {t('landing.nav.login')}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">{t('landing.nav.signup')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <FestiveHero backgroundImage={heroBg}>
        <div className="container mx-auto px-6 py-24 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur mb-8"
            >
              <PartyPopper className="h-4 w-4" />
              {t('landing.hero.eyebrow')}
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05] text-white drop-shadow-lg">
              {t('landing.hero.title')}
            </h1>

            <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 text-base font-semibold px-7 py-6 shadow-lg"
                >
                  {t(isAuthenticated ? 'landing.hero.ctaPrimaryAuth' : 'landing.hero.ctaPrimary')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/plans" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base font-semibold px-7 py-6 bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white backdrop-blur"
                >
                  {t('landing.hero.ctaSecondary')}
                </Button>
              </Link>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center justify-center gap-2 text-sm text-white/75"
            >
              <Star className="h-4 w-4 fill-primary text-primary" />
              {t('landing.hero.trustNote')}
            </motion.p>
          </motion.div>
        </div>
      </FestiveHero>

      {/* Features (fond clair pur, contraste avec le hero teinté et l'audience grise) */}
      <section id="features" className="relative pt-8 pb-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-muted-foreground">{t('landing.features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FEATURES.map(({ key, Icon }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group rounded-2xl bg-card border border-border p-7 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t(`landing.features.items.${key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`landing.features.items.${key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="relative py-24 border-t border-border bg-muted/60">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-14 text-center max-w-2xl mx-auto">
            {t('landing.audience.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-card border border-border p-8 shadow-sm"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {t('landing.audience.agencies.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.audience.agencies.description')}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl bg-card border border-border p-8 shadow-sm"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {t('landing.audience.freelancers.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.audience.freelancers.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 border-t border-border bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TESTIMONIALS.map(({ key, accent }, i) => {
              const name = t(`landing.testimonials.items.${key}.name`);
              return (
                <motion.figure
                  key={key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative flex flex-col rounded-2xl bg-card border border-border p-7 shadow-sm hover:shadow-md transition-all"
                >
                  <Quote className="absolute -top-3 left-6 h-7 w-7 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm" />
                  <blockquote className="flex-1 text-base leading-relaxed text-foreground italic mb-6">
                    « {t(`landing.testimonials.items.${key}.quote`)} »
                  </blockquote>
                  <figcaption className="flex items-center gap-3 border-t border-border pt-5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-sm font-bold text-white shadow-sm`}
                      aria-hidden="true"
                    >
                      {getInitials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t(`landing.testimonials.items.${key}.role`)} · {t(`landing.testimonials.items.${key}.agency`)}
                      </p>
                    </div>
                  </figcaption>
                </motion.figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 border-t border-border overflow-hidden bg-gradient-to-br from-primary/[0.12] via-background to-primary/[0.06]">
        <Confetti />
        <div className="container mx-auto px-6 text-center max-w-2xl mx-auto relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <PartyPopper className="mx-auto h-14 w-14 text-primary mb-5" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t('landing.cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-10">{t('landing.cta.subtitle')}</p>
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg" className="gap-2 text-base font-semibold px-8 py-6">
                {t(isAuthenticated ? 'landing.cta.buttonAuth' : 'landing.cta.button')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={logo} alt="Party Planner" className="h-8 w-8" />
                <span className="font-bold text-foreground text-lg">Party Planner</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('landing.footer.tagline')}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                {t('landing.footer.links.product')}
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                    {t('landing.footer.links.features')}
                  </a>
                </li>
                <li>
                  <Link to="/plans" className="text-muted-foreground hover:text-primary transition-colors">
                    {t('landing.footer.links.pricing')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                {t('landing.footer.links.legal')}
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    {t('landing.footer.links.terms')}
                  </Link>
                </li>
                <li>
                  <Link to="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    {t('landing.footer.links.privacy')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Party Planner. {t('landing.footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
