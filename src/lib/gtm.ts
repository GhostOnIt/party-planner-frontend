/**
 * Google Tag Manager (conteneur public — id de type GTM-XXXX).
 * GA4 se configure en général dans l’interface GTM (balise GA4 + déclencheurs).
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;

function isValidGtmId(id: string): boolean {
  return GTM_ID_PATTERN.test(id.trim());
}

/** Initialise GTM (script + noscript). À appeler une seule fois au démarrage. */
export function initGoogleTagManager(containerId: string | undefined): void {
  if (typeof document === 'undefined') return;
  const id = containerId?.trim();
  if (!id || !isValidGtmId(id)) {
    if (import.meta.env.DEV && id) {
      console.warn('[GTM] VITE_GTM_CONTAINER_ID ignoré (format attendu : GTM-XXXXXXX).');
    }
    return;
  }

  if (document.querySelector(`script[data-gtm-id="${id}"]`)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  const script = document.createElement('script');
  script.async = true;
  script.dataset.gtmId = id;
  script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`;
  document.head.appendChild(script);

  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);
}

/** Indique si GTM est configuré (pour le suivi des vues de page en SPA). */
export function isGtmEnabled(): boolean {
  const id = import.meta.env.VITE_GTM_CONTAINER_ID?.trim();
  return !!id && isValidGtmId(id);
}

/**
 * Envoie une vue de page pour les navigations client (React Router).
 * Le premier chargement est déjà couvert par le conteneur GTM ; on n’envoie qu’ensuite.
 */
export function pushGtmSpaPageView(pathname: string, search: string): void {
  if (!isGtmEnabled()) return;
  window.dataLayer = window.dataLayer || [];
  const pagePath = pathname + search;
  const pageLocation =
    typeof window !== 'undefined' ? `${window.location.origin}${pagePath}` : pagePath;

  window.dataLayer.push({
    event: 'page_view',
    page_path: pagePath,
    page_location: pageLocation,
    page_title: typeof document !== 'undefined' ? document.title : '',
  });
}
