import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { useRegister } from '@/hooks/useRegister';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiErrorMessage, getValidationErrors } from '@/api/client';
import { strongPasswordSchema } from '@/lib/passwordValidation';
import { AuthPromoPanel } from '@/components/auth/AuthPromoPanel';
import logo from '@/assets/logo.png';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: strongPasswordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const passwordRequirements = [
  { id: 1, label: "Au moins 8 caractères", check: (p: string) => p.length >= 8 },
  { id: 2, label: "Une lettre majuscule", check: (p: string) => /[A-Z]/.test(p) },
  { id: 3, label: "Un chiffre", check: (p: string) => /[0-9]/.test(p) },
];

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { mutate: registerUser, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const confirmPassword = watch('password_confirmation', '');
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const onSubmit = (data: RegisterFormValues) => {
    registerUser(data, {
      onError: (err) => {
        const validationErrors = getValidationErrors(err);
        if (validationErrors) {
          Object.entries(validationErrors).forEach(([field, messages]) => {
            setError(field as keyof RegisterFormValues, {
              message: messages[0],
            });
          });
        }
      },
    });
  };

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
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Party Planner" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-foreground">Party Planner</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-foreground"
            >
              Créez votre compte 🎊
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              Rejoignez Party Planner et commencez à organiser des événements inoubliables
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                  className="pl-10 h-12 bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  className="pl-10 h-12 bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  className="pl-10 pr-10 h-12 bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.id}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                        req.check(password)
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      {req.label}
                    </div>
                  ))}
                </motion.div>
              )}
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-sm font-medium">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmez votre mot de passe"
                  {...register('password_confirmation')}
                  aria-invalid={!!errors.password_confirmation}
                  className={`pl-10 pr-10 h-12 bg-secondary/50 border-0 focus-visible:ring-2 ${
                    confirmPassword && !passwordsMatch
                      ? "focus-visible:ring-destructive ring-2 ring-destructive"
                      : "focus-visible:ring-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {passwordsMatch && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-10 top-1/2 -translate-y-1/2"
                  >
                    <Check className="h-5 w-5 text-emerald-600" />
                  </motion.div>
                )}
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
              )}
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                J'accepte les{" "}
                <Link to="/legal/terms" target="_blank" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link to="/legal/privacy" target="_blank" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending || !acceptTerms}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity text-base font-medium group"
            >
              {isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground"
          >
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Se connecter
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
