import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { isGtmEnabled, pushGtmSpaPageView } from '@/lib/gtm';

/**
 * Envoie un événement `page_view` dans le dataLayer après chaque navigation SPA,
 * pour que GA4 (ou autres tags) dans GTM reflètent les changements de route.
 */
export function GtmRouteListener() {
  const location = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (!isGtmEnabled()) return;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    pushGtmSpaPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
}
