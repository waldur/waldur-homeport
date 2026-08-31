import store from '@/store/store';

import { clearAuthCache, resolvePostLoginTarget } from './auth/authNavigation';
import * as AuthService from './auth/AuthService';
import { MatomoInstance } from './core/matomo';
import {
  GroupInvitationTokenStorage,
  RedirectStorage,
} from './core/StorageManager';
import { cleanObject } from './core/utils';
import { DrawerService } from './drawer/actions';
import { setPrevParams, setPrevState } from './error/utils';
import { isFeatureVisible } from './features/connect';
import { MarketplaceFeatures } from './FeaturesEnums';
import { translate } from './i18n';
import { ModalService } from './modal/actions';
import { router } from './router';
import { NotifyService } from './store/notify';
import {
  clearBlockedNavigation,
  isResumableState,
} from './user/blockedNavigation';
import { UsersService } from './user/UsersService';

export function attachTransitions() {
  router.transitionService.onSuccess({}, function () {
    ModalService.close();
    DrawerService.close();
  });

  router.transitionService.onSuccess({}, function () {
    document['scrollTop'] = 0;
    const wrapper = document.querySelector('#wrapper');
    if (wrapper) {
      wrapper.scrollTop = 0;
    }
  });

  // Check profile validity for ALL authenticated users, regardless of route auth setting
  router.transitionService.onBefore(
    {
      to: () => AuthService.isAuthenticated(),
    },
    async (transition) => {
      // Allow access to profile management and auth-related states
      const allowedStates = [
        'profile-manage',
        'profile-manage-container',
        'about',
        'errorPage',
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
        // The enrollment interstitial itself, or the hook below would send
        // the user to the page they are already on, forever.
        'profile-passkeys-required',
      ];
      const toStateName = transition.to().name;
      if (
        allowedStates.some(
          (name) => toStateName === name || toStateName.startsWith(name + '.'),
        )
      ) {
        return;
      }

      // Preserve group invitation token before potential redirect to profile-manage
      if (toStateName === 'user-group-invitation') {
        const token = transition.params().token;
        if (token) {
          GroupInvitationTokenStorage.set(token);
        }
      }

      try {
        // The gate rules (passkey enforcement first, then profile validity)
        // live in resolvePostLoginTarget so the login flow and this guard can
        // never disagree about where a user must go first. Kept as a single
        // hook: transitions.test.ts locates the profile-validity hook as "the
        // first onBefore with a `to` criteria", so adding a second one ahead
        // of it silently retargets that test at the wrong callback.
        const user = await UsersService.getCurrentUser();
        const target = resolvePostLoginTarget(user, {
          toState: toStateName,
          toParams: transition.params(),
        });
        if (target.toState === toStateName) {
          return;
        }
        return transition.router.stateService.target(target.toState);
      } catch {
        // No token any more: the request answered 401 and the response
        // interceptor has already logged out and started its own transition
        // to `login` (onSessionExpired in core/authCoreSetup.ts). A redirect
        // from here would enter `login` a second time — ui-router builds a
        // redirect from this transition's original `from` path, unaware that
        // the interceptor's transition already finished — and the login view
        // config registered twice is only unregistered once on the next
        // login, so the landing page stays on screen while the address bar
        // already shows the destination. Remember where the user was going
        // and let the interceptor's transition land alone.
        if (!AuthService.isAuthenticated()) {
          RedirectStorage.set({
            toState: toStateName,
            toParams: cleanObject(transition.params()),
          });
          return false;
        }
        return transition.router.stateService.target('errorPage.serverError');
      }
    },
  );

  // If state parent is `auth` and user does not have authentication token,
  // he should be redirected to login page.

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data && state.data.auth && !AuthService.isAuthenticated(),
    },
    (transition) => {
      const toStateName = transition.to().name;

      // Show message and store token for group invitation
      if (toStateName === 'user-group-invitation') {
        const token = transition.params().token;
        if (token) {
          GroupInvitationTokenStorage.set(token);
          NotifyService.warning(
            translate('Authentication required'),
            translate('Please log in to request access to this organization.'),
          );
        }
      }

      // If `catalogue_only` feature is enabled, user should be redirected to marketplace landing page.
      if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
        return transition.router.stateService.target(
          'public.marketplace-landing',
        );
      } else {
        return transition.router.stateService.target(
          'login',
          {
            toState: transition.to().name,
            toParams: cleanObject(transition.params()),
          },
          { location: 'replace' },
        );
      }
    },
  );
  // If state data has `anonymous` flag and user has authentication token,
  // he is redirected to dashboard.

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data && state.data.anonymous && AuthService.isAuthenticated(),
    },
    (transition) => transition.router.stateService.target('profile.details'),
  );
  // If state data has `feature` field and this feature is disabled,
  // user is redirected to the feature-disabled empty state.

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data &&
        state.data.feature &&
        !isFeatureVisible(state.data.feature),
    },
    (transition) =>
      transition.router.stateService.target(
        transition.options().custom?.fallbackState ||
          'errorPage.featureDisabled',
        undefined,
        { location: false },
      ),
  );

  // Check resolvers before entering to a state
  router.transitionService.onBefore({}, async (transition) => {
    const toState = transition.to();

    const getAllStates = (state) => {
      const states = [];
      while (state) {
        states.push(state);
        state = state.parent
          ? transition.router.stateRegistry.get(state.parent)
          : null;
      }
      return states;
    };

    // Get all parent states
    const states = getAllStates(toState);

    // Permission predicates run synchronously in the onStart hook below but
    // may depend on data produced by async resolvers. Awaiting those tokens
    // here ensures a fresh deep-link doesn't evaluate permissions against
    // undefined state.
    const awaitedTokens = ['fetchCustomer', 'project'].filter((token) =>
      states.some((state) =>
        Array.isArray(state.resolve)
          ? state.resolve?.some((resolver) => resolver.token === token)
          : false,
      ),
    );

    if (awaitedTokens.length === 0) return;

    await Promise.all(
      awaitedTokens.map((token) => transition.injector().getAsync(token)),
    );
  });

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data &&
        state.data.permissions &&
        !state.data.permissions.every((permission) => {
          try {
            return permission(store.getState());
          } catch {
            // Swallow errors if permission check fails.
            return true;
          }
        }),
    },
    (transition) =>
      transition.router.stateService.target(
        transition.options().custom?.fallbackState || 'errorPage.noPermission',
      ),
  );

  router.transitionService.onError({}, (transition) => {
    const error = transition.error();
    // Erred state is terminal, user should not be redirected from erred state to login
    // so that he would be able to read error message details
    if (error && error.detail && error.detail.status === 401) {
      RedirectStorage.set({
        toState: transition.to().name,
        toParams: transition.to().params,
      });
      clearAuthCache();
      return transition.router.stateService.target('login');
    }
    if (error && error.detail) {
      if (error.detail.status === 403) {
        return transition.router.stateService.target('errorPage.noPermission');
      }
      if (error.detail.status === 428) {
        // HTTP 428 Precondition Required - user profile incomplete with enforcement enabled
        return transition.router.stateService.target('profile-manage');
      }
      if (error.detail.status === 500) {
        return transition.router.stateService.target('errorPage.severError');
      }
      if (error.detail.status === 503) {
        return transition.router.stateService.target(
          'errorPage.serviceNotAvailable',
        );
      }
    }
    if (error && error['redirectTo'] && error['status'] !== -1) {
      return transition.router.stateService.target(error['redirectTo']);
    } else {
      // `location: false` keeps the address that produced the error; the
      // error states have no url of their own, so the address bar would
      // otherwise be rewritten to '/' while the 404 page is displayed.
      return transition.router.stateService.target(
        'errorPage.notFound',
        undefined,
        { location: false },
      );
    }
  });

  router.transitionService.onStart({}, (transition) => {
    const fromName = transition.from().name;
    if (fromName) {
      setPrevState(fromName);
      setPrevParams(transition.params('from'));
    }
  });

  // Reaching a gated page means the user is through the gate: intent is spent.
  router.transitionService.onSuccess({}, (transition) => {
    if (isResumableState(transition.to().name)) {
      clearBlockedNavigation();
    }
  });

  router.transitionService.onSuccess({}, () => {
    if (MatomoInstance) {
      MatomoInstance.trackPageView();
    }
  });

  // Remember the last page worth returning to after an expired session.
  // isResumableState skips profile, error, login and home states, so gate
  // pages (profile-manage, the passkey interstitial) — where the user was
  // *sent*, not where they were going — are never stored as a destination.
  router.transitionService.onSuccess({}, (transition) => {
    if (
      transition.to().data?.auth &&
      isResumableState(transition.to().name) &&
      !Object.prototype.hasOwnProperty.call(transition.params(), 'toState')
    ) {
      RedirectStorage.set({
        toState: transition.to().name,
        toParams: transition.params(),
      });
    }
  });
}
