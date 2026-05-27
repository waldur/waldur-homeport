import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
const mockIsAuthenticated = vi.fn();
const mockIsCurrentUserValid = vi.fn();
const mockGroupInvitationTokenSet = vi.fn();
const mockTarget = vi.fn();

const onBeforeHandlers: Array<{ criteria: any; callback: any }> = [];
const onStartHandlers: Array<{ criteria: any; callback: any }> = [];
const onSuccessHandlers: Array<{ criteria: any; callback: any }> = [];
const onErrorHandlers: Array<{ criteria: any; callback: any }> = [];

vi.mock('@/store/store', () => ({
  default: { dispatch: vi.fn(), getState: vi.fn() },
}));

vi.mock('./afterBootstrap', () => ({
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
  RedirectStorage: { set: vi.fn() },
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

vi.mock('./i18n', () => ({
  translate: (s) => s,
}));

vi.mock('./modal/actions', () => ({
  closeModalDialog: vi.fn(),
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

vi.mock('./store/notify', () => ({
  showRedirectMessage: vi.fn(),
}));

vi.mock('./user/UsersService', () => ({
  UsersService: {
    isCurrentUserValid: (...args) => mockIsCurrentUserValid(...args),
  },
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
      mockIsCurrentUserValid.mockResolvedValue(true);
      const transition = createMockTransition('profile.details');

      const result = await profileValidityHook.callback(transition);

      expect(mockIsCurrentUserValid).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should redirect to profile-manage when profile is invalid', async () => {
      mockIsCurrentUserValid.mockResolvedValue(false);
      mockTarget.mockReturnValue('redirect');
      const transition = createMockTransition('profile.details');

      const result = await profileValidityHook.callback(transition);

      expect(mockTarget).toHaveBeenCalledWith('profile-manage');
      expect(result).toBe('redirect');
    });

    it('should redirect to errorPage.serverError on API failure', async () => {
      mockIsCurrentUserValid.mockRejectedValue(new Error('Network error'));
      mockTarget.mockReturnValue('error-redirect');
      const transition = createMockTransition('organization.dashboard');

      const result = await profileValidityHook.callback(transition);

      expect(mockTarget).toHaveBeenCalledWith('errorPage.serverError');
      expect(result).toBe('error-redirect');
    });
  });

  describe('group invitation token preservation', () => {
    it('should preserve group invitation token before redirect', async () => {
      mockIsCurrentUserValid.mockResolvedValue(false);
      mockTarget.mockReturnValue('redirect');
      const transition = createMockTransition('user-group-invitation', {
        token: 'my-token-123',
      });

      await profileValidityHook.callback(transition);

      expect(mockGroupInvitationTokenSet).toHaveBeenCalledWith('my-token-123');
      expect(mockTarget).toHaveBeenCalledWith('profile-manage');
    });

    it('should not set token when token param is missing', async () => {
      mockIsCurrentUserValid.mockResolvedValue(false);
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
