import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OtpInput } from '@/components/ui/otp-input';
import { useVerifyOtp, useResendOtp } from '@/hooks/useOtp';
import { getApiErrorMessage } from '@/api/client';
import { AuthPromoPanel } from '@/components/auth/AuthPromoPanel';
import type { OtpChannel } from '@/types';

const VERIFY_OTP_STATE_KEY = 'verify_otp_state';

interface VerifyOtpLocationState {
  identifier: string;
  type: 'login';
  channel: OtpChannel;
  otp_id: string | number;
  redirect?: string;
  remember_me?: boolean;
}

function saveOtpStateToStorage(state: VerifyOtpLocationState): void {
  try {
    sessionStorage.setItem(VERIFY_OTP_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function loadOtpStateFromStorage(): VerifyOtpLocationState | null {
  try {
    const raw = sessionStorage.getItem(VERIFY_OTP_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VerifyOtpLocationState;
    if (parsed?.identifier && parsed?.type === 'login' && parsed?.channel && parsed?.otp_id != null) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function clearOtpStateFromStorage(): void {
  try {
    sessionStorage.removeItem(VERIFY_OTP_STATE_KEY);
  } catch {
    // ignore
  }
}

const channelLabels: Record<OtpChannel, string> = {
  email: 'votre adresse email',
  sms: 'votre numero de telephone par SMS',
  whatsapp: 'votre numero via WhatsApp',
};

const OTP_LENGTH = 4;

export function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as VerifyOtpLocationState | null;

  // Restore state from sessionStorage when location.state is lost (tab switch/reload)
  const [restoredState] = useState<VerifyOtpLocationState | null>(() =>
    !locationState ? loadOtpStateFromStorage() : null
  );
  const state = locationState ?? restoredState;

  const [code, setCode] = useState('');
  const [otpId, setOtpId] = useState<string | number>(state?.otp_id ?? '');
  const [countdown, setCountdown] = useState(0);

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  // Persist state to sessionStorage so it survives tab switch / page reload
  useEffect(() => {
    if (locationState) {
      saveOtpStateToStorage(locationState);
    }
  }, [locationState]);

  // Update persisted state when otp_id changes (e.g. after resend)
  useEffect(() => {
    if (state && otpId !== state.otp_id) {
      saveOtpStateToStorage({ ...state, otp_id: otpId });
    }
  }, [state, otpId]);

  // Redirect only if we have neither location state nor restored state
  useEffect(() => {
    if (!state) {
      clearOtpStateFromStorage();
      navigate('/login', { replace: true });
    }
  }, [state, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clear persisted state on successful verification
  useEffect(() => {
    if (verifyOtp.isSuccess) {
      clearOtpStateFromStorage();
    }
  }, [verifyOtp.isSuccess]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === OTP_LENGTH && state && !verifyOtp.isPending) {
      handleVerify();
    }
  }, [code, state, verifyOtp.isPending]);

  const handleVerify = () => {
    if (!state || code.length !== OTP_LENGTH) return;

    verifyOtp.mutate(
      {
        identifier: state.identifier,
        code,
        type: 'login',
        remember_me: state.remember_me ?? false,
      },
      {
        onError: () => {
          setCode('');
        },
      }
    );
  };

  const handleResend = () => {
    if (countdown > 0) return;

    resendOtp.mutate(
      { otp_id: otpId },
      {
        onSuccess: (data) => {
          setOtpId(data.otp_id);
          setCountdown(60);
          setCode('');
        },
      }
    );
  };

  if (!state) {
    return null;
  }

  const ChannelIcon = Mail;

  // Success state (redirect handled by useVerifyOtp)
  if (verifyOtp.isSuccess && verifyOtp.data?.user && verifyOtp.data?.token) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:block lg:w-1/2 xl:w-[55%]">
          <AuthPromoPanel />
        </div>
        <div className="flex w-full lg:w-1/2 xl:w-[45%] flex-col items-center justify-center bg-background px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center space-y-6"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Connexion reussie !</h1>
            <p className="text-muted-foreground">Redirection en cours...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Promo */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%]">
        <AuthPromoPanel />
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 xl:w-[45%] flex-col items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Party Planner" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-foreground">Party Planner</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
            >
              <ChannelIcon className="h-6 w-6 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-foreground"
            >
              Verification du code
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-muted-foreground"
            >
              Un code de connexion a ete envoye a {channelLabels[state.channel]}
            </motion.p>
            <p className="text-sm font-medium text-muted-foreground">
              {state.channel === 'email'
                ? state.identifier
                : state.identifier.replace(/(\+\d{3})\d{5}(\d{3})/, '$1*****$2')}
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-5"
          >
            {(verifyOtp.error || resendOtp.error) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(verifyOtp.error || resendOtp.error)}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <OtpInput
                value={code}
                onChange={setCode}
                length={OTP_LENGTH}
                disabled={verifyOtp.isPending}
                error={!!verifyOtp.error}
                autoFocus
              />
              <p className="text-center text-sm text-muted-foreground">
                Entrez le code a 4 chiffres
              </p>
            </div>

            <Button
              onClick={handleVerify}
              disabled={code.length !== OTP_LENGTH || verifyOtp.isPending}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity text-base font-medium"
            >
              {verifyOtp.isPending ? 'Verification...' : 'Verifier le code'}
            </Button>

            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Pas recu le code ?</span>
              <Button
                variant="link"
                size="sm"
                onClick={handleResend}
                disabled={countdown > 0 || resendOtp.isPending}
                className="gap-1 p-0"
              >
                {resendOtp.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : countdown > 0 ? (
                  `Renvoyer (${countdown}s)`
                ) : (
                  'Renvoyer le code'
                )}
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                onClick={() => clearOtpStateFromStorage()}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour a la connexion
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
