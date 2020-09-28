// Based on https://medium.com/@franciscopa91/how-to-implement-oidc-authentication-with-react-context-api-and-react-router-205e13f2d49

/* eslint-disable no-console */
import {
  UserManager,
  WebStorageStateStore,
  Log,
  OidcClientSettings,
} from 'oidc-client';

export class ReactAuthService {
  UserManager;
  config: Partial<OidcClientSettings>;

  init(config: Partial<OidcClientSettings>) {
    this.config = config;
    this.UserManager = new UserManager({
      ...config,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    });

    // Logger
    Log.logger = console;
    Log.level = Log.DEBUG;
    this.UserManager.events.addUserLoaded(() => {
      if (window.location.href.indexOf('login') !== -1) {
        this.navigateToScreen();
      }
    });

    this.UserManager.events.addSilentRenewError((e) => {
      console.log('silent renew error', e.message);
    });

    this.UserManager.events.addAccessTokenExpired(() => {
      console.log('token expired');
      this.signinSilent();
    });
  }

  signinRedirectCallback = () => {
    this.UserManager.signinRedirectCallback().then(() => {
      '';
    });
  };

  getUser = async () => {
    const user = await this.UserManager.getUser();
    if (!user) {
      return await this.UserManager.signinRedirectCallback();
    }
    return user;
  };

  parseJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };

  signinRedirect = () => {
    localStorage.setItem('redirectUri', window.location.pathname);
    this.UserManager.signinRedirect({});
  };

  navigateToScreen = () => {
    window.location.replace('/profile/');
  };

  isAuthenticated = () => {
    const oidcStorage = JSON.parse(
      sessionStorage.getItem(
        `oidc.user:${this.config.authority}:${this.config.client_id}`,
      ),
    );

    return !!oidcStorage && !!oidcStorage.access_token;
  };

  signinSilent = () => {
    this.UserManager.signinSilent()
      .then((user) => {
        console.log('signed in', user);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  signinSilentCallback = () => {
    this.UserManager.signinSilentCallback();
  };

  createSigninRequest = () => {
    return this.UserManager.createSigninRequest();
  };

  logout = () => {
    this.UserManager.signoutRedirect({
      id_token_hint: localStorage.getItem('id_token'),
    });
    this.UserManager.clearStaleState();
  };

  signoutRedirectCallback = () => {
    this.UserManager.signoutRedirectCallback().then(() => {
      localStorage.clear();
      window.location.replace('/#/');
    });
    this.UserManager.clearStaleState();
  };
}
