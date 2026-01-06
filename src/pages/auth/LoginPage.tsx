import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useLogin } from '@/hooks/useLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiErrorMessage, getValidationErrors } from '@/api/client';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/auth/LoginPage.tsx:37',message:'Login form - onSubmit called',data:{email:data.email,hasPassword:!!data.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    login(data, {
      onError: (err) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/auth/LoginPage.tsx:40',message:'Login form - onError callback',data:{errorType:err?.constructor?.name,hasResponse:!!err?.response,status:err?.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        const validationErrors = getValidationErrors(err);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/auth/LoginPage.tsx:44',message:'Login form - validation errors extracted',data:{hasValidationErrors:!!validationErrors,errors:validationErrors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (validationErrors) {
          Object.entries(validationErrors).forEach(([field, messages]) => {
            setError(field as keyof LoginFormValues, {
              message: messages[0],
            });
          });
        }
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logo} alt="Party Planner" className="mx-auto mb-4 h-12 w-12 object-contain" />
          <CardTitle className="text-2xl">Party Planner</CardTitle>
          <CardDescription>Connectez-vous a votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Masquer' : 'Afficher'} le mot de passe
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Se souvenir de moi
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center text-sm">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline"
              >
                Mot de passe oublie ?
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Pas de compte ?{' '}
              <Link to="/register" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
