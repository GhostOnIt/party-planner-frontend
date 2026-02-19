import api from '@/api/client';

export type ActivityEventType = 'navigation' | 'ui_interaction' | 'api_call';

export interface ActivityEvent {
  type: ActivityEventType;
  action: string;
  page_url?: string;
  session_id?: string;
  timestamp?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

const FLUSH_INTERVAL_MS = 30_000; // 30 secondes
const MAX_BUFFER_SIZE = 100;
const BATCH_ENDPOINT = '/activity-logs/batch';

/** Pages d'authentification : on ne fait jamais de flush (évite 401 → redirect depuis OTP). */
const AUTH_PATHS = [
  '/login',
  '/register',
  '/verify-otp',
  '/send-otp',
  '/otp',
  '/forgot-password',
  '/reset-password',
  '/reset-password-otp',
];

function isOnAuthPage(): boolean {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  return AUTH_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

class ActivityTracker {
  private buffer: ActivityEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string;
  private isEnabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
    this.setupPageLifecycleListeners();
  }

  /**
   * Enregistrer un événement dans le buffer.
   */
  track(type: ActivityEventType, event: Omit<ActivityEvent, 'type' | 'session_id' | 'timestamp'>): void {
    if (!this.isEnabled) return;
    if (isOnAuthPage()) return;

    this.buffer.push({
      type,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname,
      ...event,
    });

    // Flush si le buffer est plein
    if (this.buffer.length >= MAX_BUFFER_SIZE) {
      this.flush();
    }
  }

  /**
   * Enregistrer une navigation de page.
   */
  trackNavigation(path: string, metadata?: Record<string, unknown>): void {
    this.track('navigation', {
      action: 'page_view',
      page_url: path,
      description: `Navigation vers ${path}`,
      metadata,
    });
  }

  /**
   * Enregistrer une interaction UI (clic, modal, filtre, onglet).
   */
  trackInteraction(action: string, element: string, metadata?: Record<string, unknown>): void {
    this.track('ui_interaction', {
      action,
      description: `${action} sur ${element}`,
      metadata: { element, ...metadata },
    });
  }

  /**
   * Enregistrer un appel API.
   */
  trackApiCall(method: string, url: string, status: number): void {
    this.track('api_call', {
      action: 'api_call',
      description: `${method.toUpperCase()} ${url} (${status})`,
      metadata: { method: method.toUpperCase(), url, status },
    });
  }

  /**
   * Envoyer le buffer au serveur.
   * N'envoie rien si on est sur une page d'auth ou sans session (évite 401 → redirect login).
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    if (isOnAuthPage()) {
      this.buffer = [];
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.buffer = [];
      return;
    }

    const events = [...this.buffer];
    this.buffer = [];

    try {
      await api.post(BATCH_ENDPOINT, { events });
    } catch {
      // En cas d'erreur, remettre les événements dans le buffer (sans dépasser la taille max)
      this.buffer = [...events, ...this.buffer].slice(0, MAX_BUFFER_SIZE);
    }
  }

  /**
   * Activer/désactiver le tracker.
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.buffer = [];
    }
  }

  /**
   * Retourne le session ID courant.
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Réinitialiser la session (ex: après login/logout).
   */
  resetSession(): void {
    this.flush();
    this.sessionId = this.generateSessionId();
  }

  /**
   * Nombre d'événements en attente dans le buffer.
   */
  get pendingCount(): number {
    return this.buffer.length;
  }

  /**
   * Nettoyer les ressources (timers, listeners).
   */
  destroy(): void {
    this.flush();
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // ─── Private ───────────────────────────────────────────

  private setupAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  private setupPageLifecycleListeners(): void {
    // Flush quand l'utilisateur quitte la page
    window.addEventListener('beforeunload', () => {
      this.flushSync();
    });

    // Flush quand la page passe en arrière-plan
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  /**
   * Flush synchrone avec sendBeacon (pour beforeunload).
   */
  private flushSync(): void {
    if (this.buffer.length === 0) return;
    if (isOnAuthPage()) {
      this.buffer = [];
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.buffer = [];
      return;
    }

    const events = [...this.buffer];
    this.buffer = [];

    const baseUrl = api.defaults.baseURL || '';
    const url = `${baseUrl}${BATCH_ENDPOINT}`;

    const blob = new Blob(
      [JSON.stringify({ events })],
      { type: 'application/json' }
    );

    // sendBeacon est fiable même pendant beforeunload
    navigator.sendBeacon(url, blob);
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Singleton global
export const activityTracker = new ActivityTracker();
