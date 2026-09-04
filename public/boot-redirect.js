// Pre-bundle sign-in redirect.
//
// Served from public/ as a plain classic script and referenced first in
// index.html. Production ingresses send `script-src 'self'` with no nonce,
// which is why this is an external file and not an inline block. It is
// deferred like the application module but listed before it, so it runs as
// soon as the document is parsed and ahead of any application code.
//
// An anonymous visitor landing on the root or the login page is sent to
// /api-auth/default/init/, where the backend resolves DEFAULT_IDP and starts
// the OIDC flow itself. That endpoint is probed first with probe=1, which
// answers 204 when a default provider is configured and writes no session
// state. Only a 204 triggers the navigation, so a 404, a redirect from a
// backend that predates the probe, and a network or CORS failure all leave
// the visitor here for the application to handle exactly as before.
//
// Whether a session already exists is decided here rather than by the
// backend, because the token lives in web storage under the same key the
// application's own isAuthenticated() reads - and the same key in OIDC
// access-token mode. A token that is present but stale is not detected: the
// application boots, its first request answers 401, and the usual expiry path
// takes over, exactly as it does today.
//
// Everything else (deep links, invitations, an existing session) falls
// through to the application, whose LandingPage keeps the same redirect as a
// fallback.
(function (win) {
  'use strict';

  function stored(storageName, key) {
    try {
      var storage = win[storageName];
      return storage ? storage.getItem(key) : null;
    } catch {
      // Blocked cookies and partitioned iframes throw on the accessor itself.
      return null;
    }
  }

  function attribute(selector, name) {
    var element = win.document.querySelector(selector);
    return element ? element.getAttribute(name) || '' : '';
  }

  var location = win.location;
  var base = new URL(attribute('base', 'href') || '/', location.href).pathname;
  if (location.pathname.indexOf(base) !== 0) {
    return;
  }
  var route = location.pathname.slice(base.length).replace(/\/+$/, '');
  if (route !== '' && route !== 'login') {
    return;
  }

  var params = new URLSearchParams(location.search);
  if (params.has('disableAutoLogin') || params.has('_invitation')) {
    return;
  }

  if (
    stored('localStorage', 'waldur/auth/token') ||
    stored('sessionStorage', 'waldur/auth/token')
  ) {
    return;
  }

  var api = attribute('meta[name="api-url"]', 'content');
  if (!api || api === '__API_URL__' || api.indexOf('%') === 0) {
    return;
  }
  if (api.charAt(api.length - 1) !== '/') {
    api += '/';
  }
  if (typeof win.fetch !== 'function') {
    return;
  }

  var target =
    api +
    'api-auth/default/init/?return_url=' +
    encodeURIComponent(location.origin);
  var lang = stored('localStorage', 'waldur/i18n/lang');
  if (lang) {
    target += '&ui_locales=' + encodeURIComponent(lang);
  }

  win
    .fetch(target + '&probe=1', {
      // A backend that predates the probe answers the OIDC redirect instead
      // of 204; manual keeps the browser from following it here, and the
      // check below ignores it.
      redirect: 'manual',
      credentials: 'omit',
      cache: 'no-store',
    })
    .then(function (response) {
      if (response.status === 204) {
        location.replace(target);
      }
    })
    .catch(function () {});
})(window);
