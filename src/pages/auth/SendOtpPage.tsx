import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSendOtp } from '@/hooks/useOtp';
import { getApiErrorMessage } from '@/api/client';
import type { OtpChannel, OtpType } from '@/types';

const sendOtpSchema = z.object({
  identifier: z.string().min(1, 'Ce champ est requis'),
});

type SendOtpFormValues = z.infer<typeof sendOtpSchema>;

const channelOptions: { value: OtpChannel; label: string; icon: typeof Mail }[] = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

const typeLabels: Record<OtpType, { title: string; description: string }> = {
  registration: {
    title: 'Verifier votre compte',
    description: 'Entrez votre email ou numero de telephone pour recevoir un code de verification',
  },
  login: {
    title: 'Connexion securisee',
    description: 'Entrez votre email ou numero de telephone pour recevoir un code de connexion',
  },
  password_reset: {
    title: 'Reinitialiser le mot de passe',
    description: 'Entrez votre email ou numero de telephone pour recevoir un code de reinitialisation',
  },
};

export function SendOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = (searchParams.get('type') as OtpType) || 'password_reset';
  const [channel, setChannel] = useState<OtpChannel>('email');

  const sendOtp = useSendOtp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendOtpFormValues>({
    resolver: zodResolver(sendOtpSchema),
  });

  const onSubmit = (data: SendOtpFormValues) => {
    sendOtp.mutate(
      {
        identifier: data.identifier,
        type,
        channel,
      },
      {
        onSuccess: (response) => {
          navigate('/otp', {
            state: {
              identifier: data.identifier,
              type,
              channel,
              otp_id: response.otp_id,
              expires_in: response.expires_in,
            },
          });
        },
      }
    );
  };

  const { title, description } = typeLabels[type];

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logo} alt="Party Planner" className="mx-auto mb-4 h-12 w-12 object-contain" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {sendOtp.error && (
              <Alert variant="destructive">
                <AlertDescription>{getApiErrorMessage(sendOtp.error)}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="identifier">
                {channel === 'email' ? 'Adresse email' : 'Numero de telephone'}
              </Label>
              <Input
                id="identifier"
                type={channel === 'email' ? 'email' : 'tel'}
                placeholder={channel === 'email' ? 'votre@email.com' : '+237 6XX XXX XXX'}
                {...register('identifier')}
                aria-invalid={!!errors.identifier}
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Recevoir le code par</Label>
              <div className="grid grid-cols-3 gap-2">
                {channelOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={channel === option.value ? 'default' : 'outline'}
                      className="flex flex-col gap-1 h-auto py-3"
                      onClick={() => setChannel(option.value)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={sendOtp.isPending}>
              {sendOtp.isPending ? 'Envoi...' : 'Envoyer le code'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour a la connexion
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
