export interface StorageAdapter {
  get(): string | null;
  set(value: string): void;
  remove(): void;
}

/**
 * What the API asks for before a change that needs the user to confirm it is
 * them: a 401 whose body has `code: "reauthentication_required"`.
 */
export interface ReauthenticationChallenge {
  /** The change a grant is needed for, such as `token_lifetime`. */
  action: string;
  /** How this user can confirm it is them; empty when they cannot. */
  methods: string[];
  /** The API's explanation, in the user's language. */
  detail?: string;
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

  /**
   * Called when the API answers 503 because a demo preset is loading
   * (`demo_reset` in the body), with the preset's name. Optional: a host
   * that never runs on a demo deployment leaves it out.
   */
  onDemoReset?: (preset: string) => void;

  /**
   * Called when the API refuses a change until the user confirms it is them
   * (the step-up challenge above). Resolve with a re-authentication grant for
   * `challenge.action`, and the request is sent once more carrying it; reject,
   * and the request fails with the rejection as its error. Optional: without
   * it the challenge reaches the caller as the 401 it is. Either way it does
   * not sign the user out.
   */
  onReauthenticationRequired?: (
    challenge: ReauthenticationChallenge,
  ) => Promise<string>;
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
