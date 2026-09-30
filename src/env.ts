import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const env = createEnv({
  /**
   * Server-side environment variables — never exposed to the browser.
   */
  server: {
    BACKEND_API_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL: z.coerce.number().positive().default(900),
    REFRESH_TOKEN_TTL: z.coerce.number().positive().default(604800),
    ALLOWED_ORIGINS: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  /**
   * Client-side environment variables — prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_API_URL: z.url(),
  },

  /**
   * Destructure all variables from `process.env` to make sure they aren't
   * tree-shaken away.
   */
  runtimeEnv: {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  /**
   * Skip validation when running in test mode or when env validation should be
   * skipped (e.g. during Docker build with empty .env).
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   */
  emptyStringAsUndefined: true,
});
