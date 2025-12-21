import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, RefreshCw, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OtpInput } from '@/components/ui/otp-input';
import { useVerifyOtp, useResendOtp } from '@/hooks/useOtp';
import { getApiErrorMessage } from '@/api/client';
import type { OtpChannel, OtpType } from '@/types';

interface OtpLocationState {
  identifier: string;
  type: OtpType;
  channel: OtpChannel;
  otp_id: number;
  expires_in: number;
}

const channelIcons: Record<OtpChannel, typeof Mail> = {
  email: Mail,
  sms: Phone,
  whatsapp: MessageCircle,
};

const channelLabels: Record<OtpChannel, string> = {
  email: 'votre adresse email',
  sms: 'votre numero de telephone par SMS',
  whatsapp: 'votre numero via WhatsApp',
};

const typeLabels: Record<OtpType, string> = {
  registration: 'verification de compte',
  login: 'connexion',
  password_reset: 'reinitialisation de mot de passe',
};

export function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OtpLocationState | null;

  const [code, setCode] = useState('');
  const [otpId, setOtpId] = useState(state?.otp_id ?? 0);
  const [countdown, setCountdown] = useState(0);
  const [verified, setVerified] = useState(false);

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  // Redirect if no state
  useEffect(() => {
    if (!state) {
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

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === 6 && state) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = () => {
    if (!state || code.length !== 6) return;

    verifyOtp.mutate(
      {
        identifier: state.identifier,
        code,
        type: state.type,
      },
      {
        onSuccess: (data) => {
          if (data.verified) {
            setVerified(true);

            // Handle different types
            if (state.type === 'password_reset' && data.reset_token) {
              // Navigate to reset password page with token
              navigate('/reset-password-otp', {
                state: {
                  identifier: state.identifier,
                  reset_token: data.reset_token,
                },
              });
            } else if (state.type === 'registration' && data.verification_token) {
              // Registration verified, redirect to login
              navigate('/login', {
                state: {
                  message: 'Votre compte a ete verifie. Vous pouvez maintenant vous connecter.',
                },
              });
            }
            // Login type is handled by the hook (auto redirect to dashboard)
          }
        },
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

  const ChannelIcon = channelIcons[state.channel];

  // Success state
  if (verified && state.type === 'login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <CardTitle>Connexion reussie !</CardTitle>
            <CardDescription>Redirection en cours...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logo} alt="Party Planner" className="mx-auto mb-4 h-12 w-12 object-contain" />
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ChannelIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Verification OTP</CardTitle>
          <CardDescription>
            Un code de {typeLabels[state.type]} a ete envoye a {channelLabels[state.channel]}
          </CardDescription>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {state.channel === 'email'
              ? state.identifier
              : state.identifier.replace(/(\+\d{3})\d{5}(\d{3})/, '$1*****$2')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
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
              length={6}
              disabled={verifyOtp.isPending}
              error={!!verifyOtp.error}
              autoFocus
            />

            <p className="text-center text-sm text-muted-foreground">
              Entrez le code a 6 chiffres
            </p>
          </div>

          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={code.length !== 6 || verifyOtp.isPending}
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

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour a la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
