import { passkey } from '@better-auth/passkey';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { db, schema } from '../../infra/db/client.js';
import { resolveApiEnv } from '../../config/env.js';

const env = resolveApiEnv();

export const auth: any = betterAuth({
  baseURL: env.auth.baseUrl,
  basePath: '/v1/auth',
  secret: env.auth.secret,
  trustedOrigins: env.auth.trustedOrigins,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.authUser,
      session: schema.authSession,
      account: schema.authAccount,
      verification: schema.authVerification,
      passkey: schema.authPasskey,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    passkey({
      rpID: env.auth.passkeyRpId,
      rpName: env.auth.passkeyRpName,
      origin: env.auth.passkeyOrigin,
    }),
  ],
});
