import store from '@waldur/store/store';

import { MatomoInstance } from './afterBootstrap';
import * as AuthService from './auth/AuthService';
import { RedirectStorage } from './core/StorageManager';
import { cleanObject } from './core/utils';
import { setPrevParams, setPrevState } from './error/utils';
import { isFeatureVisible } from './features/connect';
import { MarketplaceFeatures } from './FeaturesEnums';
import { tryAcceptInvitation } from './invitations/tryAcceptInvitation';
import { tryJoinOrganization } from './invitations/tryJoinOrganization';
import { closeModalDialog } from './modal/actions';
import { router } from './router';
import { UsersService } from './user/UsersService';

export function attachTransitions() {
  router.transitionService.onSuccess({}, function () {
    store.dispatch(closeModalDialog());
  });

  router.transitionService.onSuccess({}, function () {
    document['scrollTop'] = 0;
    const wrapper = document.querySelector('#wrapper');
    if (wrapper) {
      wrapper.scrollTop = 0;
    }
  });

  router.transitionService.onBefore(
    {
      to: (state) =>
        state.data && state.data.auth && AuthService.isAuthenticated(),
    },
    async (transition) => {
      try {
        const result = await UsersService.isCurrentUserValid();
        if (result) {
          return;
        }
        if (transition.to().name == 'profile-manage') {
          return;
        }
        return transition.router.stateService.target('profile-manage');
      } catch {
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
  // user is redirected to 404 error page.

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data &&
        state.data.feature &&
        !isFeatureVisible(state.data.feature),
    },
    (transition) =>
      transition.router.stateService.target(
        transition.options().custom?.fallbackState || 'errorPage.notFound',
      ),
  );

  // Check resolvers before entering to a state
  router.transitionService.onBefore({}, (transition) => {
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

    // check need for fetchCustomer
    const needsCustomer = states.some((state) =>
      Array.isArray(state.resolve)
        ? state.resolve?.some((resolver) => resolver.token === 'fetchCustomer')
        : false,
    );

    if (!needsCustomer) return;

    return transition.injector().getAsync('fetchCustomer');
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
      AuthService.clearAuthCache();
      return transition.router.stateService.target('login');
    }
    if (error && error.detail) {
      if (error.detail.status === 403) {
        return transition.router.stateService.target('errorPage.noPermission');
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
      return transition.router.stateService.target('errorPage.notFound');
    }
  });

  router.transitionService.onStart({}, (transition) => {
    const fromName = transition.from().name;
    if (fromName) {
      setPrevState(fromName);
      setPrevParams(transition.params('from'));
    }
  });

  router.transitionService.onSuccess({}, (transition) => {
    if (AuthService.isAuthenticated() && !transition.to().data?.skipAuth) {
      if (router.urlService.path().split('/')[1] !== 'user-group-invitations') {
        tryAcceptInvitation();
      }

      // Fallback: Check for pending group invitation on initial page load
      // Primary handling is in auth callback handlers (OauthLoginCompleted, AuthLoginCompleted)
      if (!transition.from().name) {
        tryJoinOrganization();
      }
    }
  });

  router.transitionService.onSuccess({}, () => {
    if (MatomoInstance) {
      MatomoInstance.trackPageView();
    }
  });

  router.transitionService.onSuccess({}, (transition) => {
    if (
      transition.to().data?.auth &&
      !Object.prototype.hasOwnProperty.call(transition.params(), 'toState')
    ) {
      RedirectStorage.set({
        toState: transition.to().name,
        toParams: transition.params(),
      });
    }
  });
}
