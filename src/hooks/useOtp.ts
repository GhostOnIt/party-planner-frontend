import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type {
  OtpSendRequest,
  OtpSendResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  OtpResendRequest,
  OtpResetPasswordRequest,
  AuthResponse,
} from '@/types';

/**
 * Hook for sending OTP
 */
export function useSendOtp() {
  return useMutation({
    mutationFn: async (data: OtpSendRequest) => {
      const response = await publicApi.post<OtpSendResponse>('/auth/otp/send', data);
      return response.data;
    },
  });
}

/**
 * Hook for verifying OTP
 */
export function useVerifyOtp() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: OtpVerifyRequest) => {
      const response = await publicApi.post<OtpVerifyResponse>('/auth/otp/verify', data);
      return response.data;
    },
    onSuccess: (data) => {
      // If login OTP, set auth and navigate to dashboard
      if (data.user && data.token) {
        setAuth(data.user, data.token);
        navigate('/dashboard');
      }
    },
  });
}

/**
 * Hook for resending OTP
 */
export function useResendOtp() {
  return useMutation({
    mutationFn: async (data: OtpResendRequest) => {
      const response = await publicApi.post<OtpSendResponse>('/auth/otp/resend', data);
      return response.data;
    },
  });
}

/**
 * Hook for resetting password after OTP verification
 */
export function useOtpResetPassword() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: OtpResetPasswordRequest) => {
      const response = await publicApi.post<AuthResponse>('/auth/otp/reset-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/dashboard');
    },
  });
}

/**
 * Combined hook for all OTP operations
 */
export function useOtp() {
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const resetPassword = useOtpResetPassword();

  return {
    sendOtp,
    verifyOtp,
    resendOtp,
    resetPassword,
    isLoading: sendOtp.isPending || verifyOtp.isPending || resendOtp.isPending || resetPassword.isPending,
  };
}
