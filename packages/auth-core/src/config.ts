export interface StorageAdapter {
  get(): string | null;
  set(value: string): void;
  remove(): void;
}

export interface AuthCoreConfig {
  storage: {
    token: StorageAdapter;
    method: StorageAdapter;
    impersonation: StorageAdapter;
    language: StorageAdapter;
  };

  getApiEndpoint: () => string;

  /** True once the backend's plugin config has loaded. Before that,
   * attachAuthHeader skips entirely so the bootstrap config request goes
   * out unauthenticated — this is a stronger, earlier gate than
   * isOidcAccessTokenEnabled, and must stay separate: a backend that
   * omits the OIDC flag (but has otherwise loaded) would otherwise look
   * indistinguishable from "not loaded yet", silently dropping auth
   * headers on every request forever. */
  isConfigLoaded: () => boolean;

  /** Only meaningful once isConfigLoaded() is true; getAuthPrefix defaults
   * to 'Token' while it's unknown. */
  isOidcAccessTokenEnabled: () => boolean;

  /**
   * Called once a 401 has been identified as an expired authenticated
   * session (not an anonymous visitor, not the login endpoint itself).
   * This is the one piece the package can't own — capturing "where was
   * the user going" is inherently router-specific. Implement it as:
   * compute a redirect target from the host's router state, persist it,
   * then log out.
   */
  onSessionExpired: () => void;

  /**
   * Called after a successful login, once the token is stored and the
   * client is reconfigured. Optional in the type for a host with no user
   * store — but see the caller for whether it's actually load-bearing.
   */
  onLogin?: () => unknown;
}

let config: AuthCoreConfig | undefined;

export function configureAuthCore(next: AuthCoreConfig) {
  config = next;
}

export function getAuthCoreConfig(): AuthCoreConfig {
  if (!config) {
    throw new Error(
      'waldur-auth-core: configureAuthCore() must be called before use.',
    );
  }
  return config;
}
