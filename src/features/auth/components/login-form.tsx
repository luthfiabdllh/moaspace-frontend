'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';

import { loginSchema, type LoginDTO } from '../types';
import { useLogin } from '../api/use-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Login form — uses react-hook-form + Zod v4 + TanStack Query mutation.
 * All aria-labels are present for accessibility compliance.
 */
export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginDTO) => {
    try {
      const result = await loginMutation.mutateAsync(data);

      if (result.success) {
        toast.success('Signed in successfully!');
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(result.error?.message ?? 'Invalid email or password.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
    }
  };

  const isPending = isSubmitting || loginMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Login form"
      noValidate
      className="space-y-5"
    >
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="login-email">Email address</Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
            aria-hidden="true"
          />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className={cn('pl-9', errors.email && 'border-destructive')}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p
            id="login-email-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
            aria-hidden="true"
          />
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'login-password-error' : undefined
            }
            className={cn('pl-9', errors.password && 'border-destructive')}
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p
            id="login-password-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        id="login-submit"
        type="submit"
        className="w-full"
        disabled={isPending}
        aria-label={isPending ? 'Signing in...' : 'Sign in'}
      >
        {isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
