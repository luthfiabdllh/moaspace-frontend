import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Sign In | MoaSpace',
  description: 'Sign in to your MoaSpace account',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            M
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your MoaSpace account to continue
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="sr-only">Login form</CardTitle>
            <CardDescription className="sr-only">
              Enter your credentials to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a
            href="#"
            className="font-medium text-primary underline-offset-4 hover:underline"
            aria-label="Navigate to sign up page"
          >
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
