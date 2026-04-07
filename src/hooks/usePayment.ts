import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { logger } from '@/lib/logger';
import type { Payment, PaymentMethod, PaymentStatus, PlanType } from '@/types';

// Response types
interface PaymentInitResponse {
  message: string;
  payment: Payment;
  reference: string;
  provider: string;
}

interface PaymentPollResponse {
  payment: Payment;
  is_completed: boolean;
  is_failed: boolean;
  is_pending: boolean;
}

interface PaymentStatusResponse {
  payment: Payment;
  status: PaymentStatus;
  message?: string;
}

interface InitiatePaymentData {
  event_id?: number;
  subscription_id?: number;
  phone_number: string;
  plan_type?: PlanType;
  method?: PaymentMethod;
  amount?: number;
  currency?: string;
  description?: string;
  /** Si absent, généré côté client à chaque tentative */
  idempotency_key?: string;
}

// Get payment history
export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async (): Promise<Payment[]> => {
      const response = await api.get('/payments');
      const data = response.data;

      if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data)) {
        return (data as { data: Payment[] }).data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      if (data && 'payments' in data) {
        return (data as { payments: Payment[] }).payments || [];
      }

      return [];
    },
  });
}

// Get payment status
export function usePaymentStatus(paymentId: number | null, pollInterval?: number) {
  return useQuery({
    queryKey: ['payments', paymentId, 'status'],
    queryFn: async (): Promise<PaymentStatusResponse> => {
      const response = await api.get(`/payments/${paymentId}/status`);
      return response.data;
    },
    enabled: !!paymentId,
    refetchInterval: pollInterval || false,
  });
}

// Poll payment status (real-time)
export function usePollPaymentStatus(paymentId: string | number | null, enabled: boolean = true) {
  logger.log('usePollPaymentStatus called with:', { paymentId, enabled });

  return useQuery({
    queryKey: ['payments', paymentId, 'poll'],
    queryFn: async (): Promise<PaymentPollResponse> => {
      logger.log('Polling payment status for ID:', paymentId);
      const response = await api.get(`/payments/${paymentId}/poll`);
      logger.log('Poll response:', response.data);
      return response.data;
    },
    enabled: !!paymentId && enabled,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: false,
    retry: 3,
  });
}

// Initiate payment (uses specific provider endpoint if method is provided)
export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitiatePaymentData): Promise<PaymentInitResponse> => {
      const { method, idempotency_key, ...rest } = data;
      const idempotencyKey = idempotency_key ?? crypto.randomUUID();
      const paymentData = { ...rest, idempotency_key: idempotencyKey };

      // Use specific provider endpoint if method is provided
      let endpoint = '/payments/initiate';
      if (method === 'mtn_mobile_money') {
        endpoint = '/payments/mtn/initiate';
      } else if (method === 'airtel_money') {
        endpoint = '/payments/airtel/initiate';
      }

      logger.log('Payment request:', { endpoint, data: paymentData });
      const response = await api.post(endpoint, paymentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// Initiate MTN Mobile Money payment
export function useInitiateMTNPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitiatePaymentData): Promise<PaymentInitResponse> => {
      const { idempotency_key, ...rest } = data;
      const response = await api.post('/payments/mtn/initiate', {
        ...rest,
        idempotency_key: idempotency_key ?? crypto.randomUUID(),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// Initiate Airtel Money payment
export function useInitiateAirtelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitiatePaymentData): Promise<PaymentInitResponse> => {
      const { idempotency_key, ...rest } = data;
      const response = await api.post('/payments/airtel/initiate', {
        ...rest,
        idempotency_key: idempotency_key ?? crypto.randomUUID(),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// Retry failed payment
export function useRetryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string | number): Promise<PaymentInitResponse> => {
      const response = await api.post(`/payments/${paymentId}/retry`);
      return response.data;
    },
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', paymentId] });
    },
  });
}

// Check if we're in sandbox mode (via VITE_PAYMENT_ENV variable)
const isSandbox = import.meta.env.VITE_PAYMENT_ENV === 'sandbox';

// Helper to determine provider from phone number (Congo-Brazzaville)
export function getProviderFromPhone(phone: string): PaymentMethod | null {
  let cleanPhone = phone.replace(/[\s\-()]/g, '');
  if (cleanPhone.startsWith('00242')) {
    cleanPhone = cleanPhone.slice(5);
  }
  cleanPhone = cleanPhone.replace(/^\+?242/, '');

  // In sandbox mode, MTN test numbers start with 467
  if (isSandbox && /^467/.test(cleanPhone)) {
    return 'mtn_mobile_money';
  }

  // MTN Congo prefix: 06
  if (/^06/.test(cleanPhone)) {
    return 'mtn_mobile_money';
  }

  // Airtel Congo prefixes: 04, 05
  if (/^0[45]/.test(cleanPhone)) {
    return 'airtel_money';
  }

  return null;
}

/** Télécharge le reçu PDF (paiement complété). */
export async function downloadPaymentReceipt(paymentId: string): Promise<void> {
  const response = await api.get(`/payments/${paymentId}/receipt`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `recu-paiement-${paymentId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
