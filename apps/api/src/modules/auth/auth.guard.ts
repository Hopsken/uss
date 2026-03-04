import { Elysia } from 'elysia';
import { auth } from './auth.instance.js';

function isPublicPath(path: string): boolean {
  return path === '/health' || path === '/v1/health' || path.startsWith('/auth') || path.startsWith('/v1/auth');
}

export async function enforceAuth({ request, path, set }: any) {
  if (request.method === 'OPTIONS' || isPublicPath(path)) {
    return;
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    set.status = 401;
    return { error: 'unauthorized' };
  }
}

export const authGuardPlugin = new Elysia({ name: 'auth-guard' }).onBeforeHandle(enforceAuth);
