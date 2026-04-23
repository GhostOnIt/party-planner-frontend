import { pushDomDebugEvent } from '@/lib/domDebug';

/**
 * Trace console pour le flux paiement (prod ou dev).
 *
 * Activation :
 * - Dans la console du navigateur : localStorage.setItem('pp_payment_trace', '1'); puis recharger la page
 * - Ou build avec VITE_ENABLE_PAYMENT_TRACE=true
 *
 * Désactivation : localStorage.removeItem('pp_payment_trace'); location.reload()
 */

function readTraceFlag(): boolean {
  if (import.meta.env.VITE_ENABLE_PAYMENT_TRACE === 'true') {
    return true;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem('pp_payment_trace') === '1';
  } catch {
    return false;
  }
}

let loggedBanner = false;
export function isPaymentTraceEnabled(): boolean {
  return readTraceFlag();
}

export function paymentTrace(step: string, detail?: unknown): void {
  // Forward breadcrumbs to DOM debug collector when available.
  pushDomDebugEvent('payment:trace', { step, detail });

  if (!readTraceFlag()) {
    return;
  }
  if (typeof window !== 'undefined' && !loggedBanner) {
    loggedBanner = true;
    console.info(
      '[PP Payment trace] Activé. Désactiver : localStorage.removeItem("pp_payment_trace"); location.reload()'
    );
  }
  const ts = new Date().toISOString();
  if (detail !== undefined) {
    console.info(`[PP Payment ${ts}] ${step}`, detail);
  } else {
    console.info(`[PP Payment ${ts}] ${step}`);
  }
}
