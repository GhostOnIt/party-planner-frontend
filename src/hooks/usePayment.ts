import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
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
  event_id: number;
  phone_number: string;
  plan_type?: PlanType;
  method?: PaymentMethod;
  amount?: number;
  currency?: string;
}

// Get payment history
export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async (): Promise<Payment[]> => {
      const response = await api.get('/payments');
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }
      if (data && 'data' in data) {
        return data.data || [];
      }
      if (data && 'payments' in data) {
        return data.payments || [];
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
export function usePollPaymentStatus(paymentId: number | null, enabled: boolean = true) {
  console.log('usePollPaymentStatus called with:', { paymentId, enabled });

  return useQuery({
    queryKey: ['payments', paymentId, 'poll'],
    queryFn: async (): Promise<PaymentPollResponse> => {
      console.log('Polling payment status for ID:', paymentId);
      const response = await api.get(`/payments/${paymentId}/poll`);
      console.log('Poll response:', response.data);
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
      const { method, ...paymentData } = data;

      // Use specific provider endpoint if method is provided
      let endpoint = '/payments/initiate';
      if (method === 'mtn_mobile_money') {
        endpoint = '/payments/mtn/initiate';
      } else if (method === 'airtel_money') {
        endpoint = '/payments/airtel/initiate';
      }

      console.log('Payment request:', { endpoint, data: paymentData });
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
      const response = await api.post('/payments/mtn/initiate', data);
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
      const response = await api.post('/payments/airtel/initiate', data);
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
    mutationFn: async (paymentId: number): Promise<PaymentInitResponse> => {
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
  // Remove spaces, dashes, and country code
  const cleanPhone = phone.replace(/[\s\-()]/g, '').replace(/^\+?242/, '');

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
