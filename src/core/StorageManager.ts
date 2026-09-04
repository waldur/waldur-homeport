import { ENV } from '@/core/config';

const getStorage = (): Storage => {
  if (ENV.authStorage === 'localStorage') {
    return localStorage;
  } else if (ENV.authStorage === 'sessionStorage') {
    return sessionStorage;
  }
  // Default fallback
  return localStorage;
};

class StringStorageManager {
  constructor(private readonly key: string) {}

  set(value: string): void {
    getStorage().setItem(this.key, value);
  }

  get(): string | null {
    return getStorage().getItem(this.key);
  }

  remove(): void {
    getStorage().removeItem(this.key);
  }
}

class JsonStorageManager<T = never> {
  constructor(private readonly key: string) {}

  set(value: T): void {
    getStorage().setItem(this.key, JSON.stringify(value));
  }

  get(): T | null {
    const value = getStorage().getItem(this.key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    return null;
  }

  remove(): void {
    getStorage().removeItem(this.key);
  }
}

export const AuthTokenStorage = new StringStorageManager('waldur/auth/token');

// When the token in AuthTokenStorage stops being accepted, as an ISO 8601
// string. Recorded from /users/me/ so public/boot-redirect.js can tell a live
// session from a stale token before the application loads; see
// UsersService.recordTokenExpiry for when it is written.
export const AuthTokenExpiryStorage = new StringStorageManager(
  'waldur/auth/token_expires_at',
);

export const AuthMethodStorage = new StringStorageManager('waldur/auth/method');

export const RedirectStorage = new JsonStorageManager<{
  toState: string;
  toParams: object;
}>('waldur/auth/redirect');

/** Separate from RedirectStorage, which the login flow overwrites constantly. */
export const BlockedNavigationStorage = new JsonStorageManager<{
  toState: string;
  toParams: object;
}>('waldur/navigation/blocked');

export const ImpersonationStorage = new StringStorageManager(
  'waldur/auth/impersonation',
);

export const InvitationTokenStorage = new StringStorageManager(
  'waldur/invitation/token',
);

export const GroupInvitationTokenStorage = new StringStorageManager(
  'waldur/group-invitation/token',
);

export const LanguageStorage = new StringStorageManager('waldur/i18n/lang');

export const ResourcesFilterStorage = new JsonStorageManager<any>(
  'waldur/filter/resources',
);
