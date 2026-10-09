"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// --- HELPER COMPONENTS (ICONS) ---

export const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    viewBox="0 0 48 48"
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
    />
  </svg>
);

// --- TYPE DEFINITIONS ---

export interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  children?: React.ReactNode;
  errorMessage?: string | null;
  onDismissError?: () => void;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  emailError?: string;
  passwordError?: string;
  submitButtonText?: string;
  googleButtonText?: string;
  footerNotice?: React.ReactNode;
  emailProps?: React.InputHTMLAttributes<HTMLInputElement>;
  passwordProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rememberMeProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

// --- CONSTANTS ---

export const DEFAULT_HERO_IMAGE = "/images/img-auth.jpg";

// --- SUB-COMPONENTS ---

export const GlassInputWrapper = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10 ${className}`}
  >
    {children}
  </div>
);

// --- REUSABLE SPLIT LAYOUT ---

export interface AuthSplitLayoutProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  children: React.ReactNode;
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  title,
  description,
  heroImageSrc = DEFAULT_HERO_IMAGE,
  children,
}) => {
  return (
    <div className="min-h-dvh flex flex-col md:flex-row font-geist w-full">
      {/* Left column: form content */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 overflow-y-auto relative">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {title && (
              <h1 className="animate-element animate-delay-100 text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="animate-element animate-delay-200 text-muted-foreground text-sm sm:text-base">
                {description}
              </p>
            )}
            {children}
          </div>
        </div>
      </section>

      {/* Right column: hero image */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4 min-h-150">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center shadow-2xl overflow-hidden"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          ></div>
        </section>
      )}
    </div>
  );
};

// --- MAIN SIGN IN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <span className="font-light text-foreground tracking-tighter">Welcome</span>
  ),
  description = "Access your account and continue your journey with us",
  heroImageSrc = DEFAULT_HERO_IMAGE,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  children,
  errorMessage,
  onDismissError,
  isLoading = false,
  isGoogleLoading = false,
  emailError,
  passwordError,
  submitButtonText = "Sign In",
  googleButtonText = "Continue with Google",
  footerNotice,
  emailProps,
  passwordProps,
  rememberMeProps,
}: SignInPageProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col md:flex-row font-geist w-full">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 overflow-y-auto relative">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight text-foreground">
              {title}
            </h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">
              {description}
            </p>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                role="alert"
                className="animate-element animate-delay-200 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive dark:text-red-400 shadow-2xs transition-all"
              >
                <div className="size-8 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0 mt-0.5 text-destructive">
                  <AlertCircle className="size-4.5" />
                </div>
                <div className="leading-snug flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold block text-sm text-destructive dark:text-red-400">
                      Gagal Masuk ke Akun
                    </span>
                    {onDismissError && (
                      <button
                        type="button"
                        onClick={onDismissError}
                        className="text-destructive/70 hover:text-destructive p-0.5 rounded-md hover:bg-destructive/10 transition-colors cursor-pointer"
                        aria-label="Tutup pemberitahuan gagal masuk"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-destructive/90 dark:text-red-300/90 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {children ? (
              children
            ) : (
              <>
                <form className="space-y-5" onSubmit={onSignIn} noValidate>
                  <div className="animate-element animate-delay-300">
                    <label
                      htmlFor="login-email"
                      className="text-sm font-medium text-muted-foreground block mb-2"
                    >
                      Email Address
                    </label>
                    <GlassInputWrapper
                      className={emailError ? "border-destructive/70" : ""}
                    >
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email address"
                        className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground"
                        {...emailProps}
                      />
                    </GlassInputWrapper>
                    {emailError && (
                      <p
                        id="login-email-error"
                        role="alert"
                        className="text-xs text-destructive mt-1.5 px-1"
                      >
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div className="animate-element animate-delay-400">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-medium text-muted-foreground block mb-2"
                    >
                      Password
                    </label>
                    <GlassInputWrapper
                      className={passwordError ? "border-destructive/70" : ""}
                    >
                      <div className="relative">
                        <input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground"
                          {...passwordProps}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide visibility" : "Show visibility"
                          }
                          className="absolute inset-y-0 right-3 flex items-center p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </GlassInputWrapper>
                    {passwordError && (
                      <p
                        id="login-password-error"
                        role="alert"
                        className="text-xs text-destructive mt-1.5 px-1"
                      >
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        className="custom-checkbox"
                        {...rememberMeProps}
                      />
                      <span className="text-foreground/90 text-sm">
                        Keep me signed in
                      </span>
                    </label>
                    <a
                      href="/forgot-password"
                      onClick={(e) => {
                        if (onResetPassword) {
                          e.preventDefault();
                          onResetPassword();
                        }
                      }}
                      className="hover:underline text-violet-400 transition-colors text-sm"
                    >
                      Reset password
                    </a>
                  </div>

                  <button
                    id="login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                    )}
                    <span>
                      {isLoading ? "Signing In..." : submitButtonText}
                    </span>
                  </button>
                </form>

                <div className="animate-element animate-delay-700 relative flex items-center justify-center">
                  <span className="w-full border-t border-border"></span>
                  <span className="px-4 text-sm text-muted-foreground bg-background absolute">
                    Or continue with
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                  className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors cursor-pointer text-sm font-medium text-foreground disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span>
                    {isGoogleLoading
                      ? "Mengalihkan ke Google..."
                      : googleButtonText}
                  </span>
                </button>

                {footerNotice ? (
                  footerNotice
                ) : (
                  <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
                    New to our platform?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onCreateAccount?.();
                      }}
                      className="text-violet-400 hover:underline transition-colors"
                    >
                      Create Account
                    </a>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Right column: hero image */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4 min-h-150">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center shadow-2xl overflow-hidden"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10" />
          </div>
        </section>
      )}
    </div>
  );
};
