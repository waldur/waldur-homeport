import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockIsAuthenticated = vi.fn();
const mockIsCurrentUserValid = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockNeedsPasskeyEnrollment = vi.fn();
const mockGroupInvitationTokenSet = vi.fn();
const mockRedirectStorageSet = vi.fn();
const mockTarget = vi.fn();

const onBeforeHandlers: Array<{ criteria: any; callback: any }> = [];
const onStartHandlers: Array<{ criteria: any; callback: any }> = [];
const onSuccessHandlers: Array<{ criteria: any; callback: any }> = [];
const onErrorHandlers: Array<{ criteria: any; callback: any }> = [];

vi.mock('@/store/store', () => ({
  default: { dispatch: vi.fn(), getState: vi.fn() },
}));

vi.mock('./core/matomo', () => ({
  MatomoInstance: null,
}));

vi.mock('./auth/AuthService', () => ({
  isAuthenticated: (...args) => mockIsAuthenticated(...args),
  clearAuthCache: vi.fn(),
}));

vi.mock('./core/StorageManager', () => ({
  GroupInvitationTokenStorage: {
    set: (...args) => mockGroupInvitationTokenSet(...args),
  },
  RedirectStorage: { set: (...args) => mockRedirectStorageSet(...args) },
  BlockedNavigationStorage: { set: vi.fn(), get: vi.fn(), remove: vi.fn() },
}));

vi.mock('./core/utils', () => ({
  cleanObject: (obj) => obj,
}));

vi.mock('./error/utils', () => ({
  setPrevParams: vi.fn(),
  setPrevState: vi.fn(),
}));

vi.mock('./features/connect', () => ({
  isFeatureVisible: vi.fn(() => false),
}));

vi.mock('./FeaturesEnums', () => ({
  MarketplaceFeatures: {},
}));

vi.mock('./router', () => ({
  router: {
    transitionService: {
      onBefore: (criteria, callback) => {
        onBeforeHandlers.push({ criteria, callback });
      },
      onStart: (criteria, callback) => {
        onStartHandlers.push({ criteria, callback });
      },
      onSuccess: (criteria, callback) => {
        onSuccessHandlers.push({ criteria, callback });
      },
      onError: (criteria, callback) => {
        onErrorHandlers.push({ criteria, callback });
      },
    },
    urlService: { path: vi.fn(() => '/') },
  },
}));

vi.mock('./user/UsersService', () => ({
  UsersService: {
    getCurrentUser: (...args) => mockGetCurrentUser(...args),
  },
  // The guard validates the resolved user through resolvePostLoginTarget,
  // which calls the synchronous isUserValid.
  isUserValid: (...args) => mockIsCurrentUserValid(...args),
}));

// The passkey guard shares the profile-validity hook, so every test through
// that hook now resolves a user. Default to one that needs nothing, so the
// existing cases keep testing what they were written to test.
vi.mock('./user/passkeys/enforcement', () => ({
  needsPasskeyEnrollment: (...args) => mockNeedsPasskeyEnrollment(...args),
}));

import { attachTransitions } from './transitions';

function createMockTransition(toStateName: string, params: any = {}) {
  return {
    to: () => ({ name: toStateName, data: {}, params: () => params }),
    from: () => ({ name: '' }),
    params: (type?: string) => (type === 'from' ? {} : params),
    router: {
      stateService: {
        target: (...args) => mockTarget(...args),
      },
      stateRegistry: { get: vi.fn() },
    },
    injector: () => ({ getAsync: vi.fn() }),
    options: () => ({}),
  };
}

describe('Profile validity transition guard', () => {
  let profileValidityHook: any;

  beforeEach(() => {
    vi.clearAllMocks();
    onBeforeHandlers.length = 0;
    onStartHandlers.length = 0;
    onSuccessHandlers.length = 0;
    onErrorHandlers.length = 0;

    mockIsAuthenticated.mockReturnValue(true);
    // Defaults that preserve what the pre-existing cases test: a user is
    // resolvable and does not owe a passkey, so the hook falls through to the
    // profile-validity check as before.
    mockGetCurrentUser.mockResolvedValue({ username: 'alice' });
    mockNeedsPasskeyEnrollment.mockReturnValue(false);

    attachTransitions();

    // The profile validity hook is the first onBefore with a `to` criteria function
    profileValidityHook = onBeforeHandlers.find(
      (h) => typeof h.criteria.to === 'function',
    );
    expect(profileValidityHook).toBeTruthy();
  });

  describe('allowed states bypass profile check', () => {
    const allowedStates = [
      'profile-manage',
      'profile-manage-container',
      'about',
      'about.tos',
      'about.privacy',
      'errorPage',
      'errorPage.notFound',
      'errorPage.serverError',
      'invitation-accept',
      'invitation-approve',
      'invitation-reject',
      'supportFeedback',
      'user-email-change',
      'login',
      'logout',
      'home.login_completed',
      'home.oauth_login_completed',
      'home.login_failed',
      'home.logout_completed',
      'home.logout_failed',
    ];

    it.each(allowedStates)(
      'should allow navigation to "%s" without profile check',
      async (stateName) => {
        const transition = createMockTransition(stateName);
        const result = await profileValidityHook.callback(transition);

        expect(result).toBeUndefined();
        expect(mockIsCurrentUserValid).not.toHaveBeenCalled();
        expect(mockTarget).not.toHaveBeenCalled();
      },
    );
  });

  describe('protected states require valid profile', () => {
    it('should allow navigation when profile is valid', async () => {
      mockIsCurrentUserValid.mockReturnValue(true);
      const transition = createMockTransition('profile.details');

      const result = await profileValidityHook.callback(transition);

      expect(mockIsCurrentUserValid).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should redirect to profile-manage when profile is invalid', async () => {
      mockIsCurrentUserValid.mockReturnValue(false);
      mockTarget.mockReturnValue('redirect');
      const transition = createMockTransition('profile.details');

      const result = await profileValidityHook.callback(transition);

      expect(mockTarget).toHaveBeenCalledWith('profile-manage');
      expect(result).toBe('redirect');
    });

    it('should redirect to errorPage.serverError on API failure', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('Network error'));
      mockTarget.mockReturnValue('error-redirect');
      const transition = createMockTransition('organization.dashboard');

      const result = await profileValidityHook.callback(transition);

      expect(mockTarget).toHaveBeenCalledWith('errorPage.serverError');
      expect(result).toBe('error-redirect');
    });
  });

  describe('passkey enforcement guard', () => {
    it('sends a privileged account with no passkey to the interstitial', async () => {
      mockNeedsPasskeyEnrollment.mockReturnValue(true);
      const transition = createMockTransition('projects');

      const result = await profileValidityHook.callback(transition);

      expect(mockTarget).toHaveBeenCalledWith('profile-passkeys-required');
      expect(result).toBeDefined();
    });

    it('does not run the profile validity check when a passkey is owed', async () => {
      // Staff and support are "always valid" for profile completeness, so the
      // passkey check has to come first or it would never be reached.
      mockNeedsPasskeyEnrollment.mockReturnValue(true);

      await profileValidityHook.callback(createMockTransition('projects'));

      expect(mockIsCurrentUserValid).not.toHaveBeenCalled();
    });

    it('lets the interstitial itself through', async () => {
      // Otherwise the hook redirects to the page the user is already on.
      mockNeedsPasskeyEnrollment.mockReturnValue(true);

      const result = await profileValidityHook.callback(
        createMockTransition('profile-passkeys-required'),
      );

      expect(result).toBeUndefined();
      expect(mockNeedsPasskeyEnrollment).not.toHaveBeenCalled();
    });

    it('does not interfere when no passkey is owed', async () => {
      mockNeedsPasskeyEnrollment.mockReturnValue(false);
      mockIsCurrentUserValid.mockReturnValue(true);

      const result = await profileValidityHook.callback(
        createMockTransition('projects'),
      );

      expect(result).toBeUndefined();
      expect(mockIsCurrentUserValid).toHaveBeenCalled();
    });
  });

  describe('group invitation token preservation', () => {
    it('should preserve group invitation token before redirect', async () => {
      mockIsCurrentUserValid.mockReturnValue(false);
      mockTarget.mockReturnValue('redirect');
      const transition = createMockTransition('user-group-invitation', {
        token: 'my-token-123',
      });

      await profileValidityHook.callback(transition);

      expect(mockGroupInvitationTokenSet).toHaveBeenCalledWith('my-token-123');
      expect(mockTarget).toHaveBeenCalledWith('profile-manage');
    });

    it('should not set token when token param is missing', async () => {
      mockIsCurrentUserValid.mockReturnValue(false);
      mockTarget.mockReturnValue('redirect');
      const transition = createMockTransition('user-group-invitation', {});

      await profileValidityHook.callback(transition);

      expect(mockGroupInvitationTokenSet).not.toHaveBeenCalled();
    });
  });

  describe('hook only fires for authenticated users', () => {
    it('should match when user is authenticated', () => {
      mockIsAuthenticated.mockReturnValue(true);
      expect(profileValidityHook.criteria.to()).toBe(true);
    });

    it('should not match when user is not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false);
      expect(profileValidityHook.criteria.to()).toBe(false);
    });
  });
});

describe('Redirect persistence on success', () => {
  const findRedirectHook = () =>
    onSuccessHandlers.find((h) => {
      mockRedirectStorageSet.mockClear();
      h.callback({
        ...createMockTransition('project.details'),
        to: () => ({ name: 'project.details', data: { auth: true } }),
      });
      return mockRedirectStorageSet.mock.calls.length > 0;
    });

  beforeEach(() => {
    vi.clearAllMocks();
    onBeforeHandlers.length = 0;
    onStartHandlers.length = 0;
    onSuccessHandlers.length = 0;
    onErrorHandlers.length = 0;
    attachTransitions();
  });

  it('remembers a regular authenticated page', () => {
    const hook = findRedirectHook();
    expect(hook).toBeTruthy();
    mockRedirectStorageSet.mockClear();

    hook.callback({
      ...createMockTransition('project.details', { uuid: '1' }),
      to: () => ({ name: 'project.details', data: { auth: true } }),
    });

    expect(mockRedirectStorageSet).toHaveBeenCalledWith({
      toState: 'project.details',
      toParams: { uuid: '1' },
    });
  });

  it.each(['profile-manage', 'profile-passkeys-required'])(
    'never remembers the gate page %s as a login destination',
    (gate) => {
      const hook = findRedirectHook();
      mockRedirectStorageSet.mockClear();

      hook.callback({
        ...createMockTransition(gate),
        to: () => ({ name: gate, data: { auth: true } }),
      });

      expect(mockRedirectStorageSet).not.toHaveBeenCalled();
    },
  );
});

describe('Transition error fallback', () => {
  let errorHook: any;

  beforeEach(() => {
    vi.clearAllMocks();
    onBeforeHandlers.length = 0;
    onStartHandlers.length = 0;
    onSuccessHandlers.length = 0;
    onErrorHandlers.length = 0;

    attachTransitions();

    expect(onErrorHandlers).toHaveLength(1);
    errorHook = onErrorHandlers[0];
  });

  it('shows the 404 page without rewriting the address bar', () => {
    const transition = {
      ...createMockTransition('some-state'),
      error: () => ({}),
    };

    errorHook.callback(transition);

    expect(mockTarget).toHaveBeenCalledWith('errorPage.notFound', undefined, {
      location: false,
    });
  });
});
