import { Elysia, t } from 'elysia';
import type { BootstrapStatusResponse } from '@uss/shared';
import { auth } from './auth.instance.js';
import { authRepository } from './auth.repository.js';
import { resolveApiEnv } from '../../config/env.js';

const bootstrapStartSchema = t.Object({
  email: t.String({ format: 'email' }),
  name: t.String({ minLength: 1 }),
  password: t.String({ minLength: 8 }),
});

const bootstrapResetSchema = t.Object({
  resetSecret: t.String({ minLength: 1 }),
});

async function loadBootstrapStatus(): Promise<BootstrapStatusResponse> {
  await authRepository.ensureAuthReady();
  const userCount = await authRepository.countUsers();
  return { needsBootstrap: userCount === 0 };
}

export const authRoutes = new Elysia({ name: 'auth-routes' })
  .get('/auth/bootstrap/status', async (): Promise<BootstrapStatusResponse> => loadBootstrapStatus())
  .post(
    '/auth/bootstrap/start',
    async ({ body, request, set }) => {
      await authRepository.ensureAuthReady();
      const userCount = await authRepository.countUsers();

      if (userCount > 0) {
        set.status = 409;
        return { error: 'bootstrap_already_completed' };
      }

      const response = await auth.api.signUpEmail({
        headers: request.headers,
        asResponse: true,
        body: {
          email: body.email,
          name: body.name,
          password: body.password,
          rememberMe: true,
        },
      });

      if (!response.ok) {
        set.status = response.status;
        return { error: 'bootstrap_failed' };
      }

      const payload = (await response.json()) as { user: { id: string } };
      const setCookieValues =
        typeof (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === 'function'
          ? (response.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
          : [];

      if (setCookieValues.length > 0) {
        set.headers['set-cookie'] = setCookieValues.join(', ');
      } else {
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          set.headers['set-cookie'] = setCookie;
        }
      }

      return {
        ok: true,
        userId: payload.user.id,
        bootstrapComplete: true,
      };
    },
    { body: bootstrapStartSchema },
  )
  .post(
    '/auth/bootstrap/reset',
    async ({ body, set }) => {
      const resetSecret = resolveApiEnv().auth.bootstrapResetSecret;
      if (!resetSecret) {
        set.status = 501;
        return { error: 'reset_not_enabled' };
      }

      if (body.resetSecret !== resetSecret) {
        set.status = 403;
        return { error: 'forbidden' };
      }

      await authRepository.resetAuthData();
      return { ok: true };
    },
    { body: bootstrapResetSchema },
  )
  .all('/auth/*', ({ request, set }) => {
    const pathname = new URL(request.url).pathname.replace(/\/+$/, '');
    if (pathname.endsWith('/auth/sign-up/email')) {
      set.status = 404;
      return { error: 'not_found' };
    }

    return auth.handler(request);
  });
