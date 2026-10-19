// Brands the boot splash before its first paint.
//
// A plain classic script, served and emitted next to the app by the
// waldurBootSplash() Vite plugin (src/vite.js), for the same reason as
// waldur-homeport's public/boot-redirect.js: production ingresses send
// `script-src 'self'`, so no inline block. The plugin puts it in <head>,
// neither deferred nor async, so it runs before the browser parses, let
// alone paints, the splash at the end of <body>. It therefore cannot touch
// the splash itself. It sets what the splash's styles (src/splash.css) read
// instead: the theme, the brand colour and logo, and the text of each
// [data-boot-text] slot (the deployment's name, and the status, slow-notice
// and reload text in the user's language), as custom properties and
// attributes on <html>.
//
// The branding is whatever the previous visit stored under
// 'waldur/boot-splash' (written by saveSplashBranding() in src/index.ts once
// the configuration has loaded). Every Waldur app on the origin shares it,
// so the root app and its micro-apps brand each other's splash. The logo is
// stored as a small data: URI, so it is there in the very first frame. A
// first visit, or blocked storage, keeps the defaults in the markup.
//
// The application mounts underneath this fixed splash and removes it with
// dismissBootSplash() once its first page is ready.
(function (win, doc) {
  'use strict';

  var SLOW_AFTER_MS = 8000;
  var root = doc.documentElement;

  function stored(key) {
    try {
      return win.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  // A CSS string for `content: var(--boot-text-*)` and `url()`.
  function cssString(text) {
    return '"' + text.replace(/[\\"\n\r\f]/g, ' ') + '"';
  }

  // Fills a [data-boot-text] slot of the splash (see splash.css).
  function setText(key, text) {
    if (typeof text === 'string' && text) {
      root.style.setProperty('--boot-text-' + key, cssString(text));
      root.setAttribute('data-boot-text-' + key, '');
    }
  }

  var branding = null;
  try {
    branding = JSON.parse(stored('waldur/boot-splash'));
  } catch {
    branding = null;
  }

  // Same rule as the apps' getInitialTheme(), applied early so
  // the splash is not painted light and then flipped to dark.
  var theme = stored('waldur/theme/name');
  if (branding && branding.disableDarkTheme) {
    theme = 'light';
  } else if (theme !== 'light' && theme !== 'dark') {
    theme =
      win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  }
  root.setAttribute('data-theme', theme);

  if (branding && typeof branding === 'object') {
    if (
      typeof branding.color === 'string' &&
      /^#[0-9a-f]{6}$/i.test(branding.color)
    ) {
      root.style.setProperty('--boot-brand', branding.color);
    }
    var name = typeof branding.name === 'string' ? branding.name : '';
    var texts =
      branding.texts && typeof branding.texts === 'object'
        ? branding.texts
        : {};
    setText('name', name);
    // Without a cached translation, keep the default wording with the name.
    setText('status', texts.status || (name && 'Starting ' + name + '…'));
    setText('slow', texts.slow);
    setText('reload', texts.reload);
    if (typeof branding.logo === 'string' && branding.logo) {
      root.style.setProperty(
        '--boot-logo',
        'url(' + cssString(branding.logo) + ')',
      );
      root.setAttribute('data-boot-logo', '');
    }
  }

  // A stalled bundle download looks exactly like a working one, so admit it
  // after a while and offer the one thing that usually helps. If the splash
  // is still on screen, unhide its slow-notice reload button.
  win.setTimeout(
    function () {
      var slow = doc.querySelector('.boot-splash--static .boot-splash__slow');
      if (!slow) {
        return;
      }
      var reload = slow.querySelector('button');
      if (reload) {
        reload.addEventListener('click', function () {
          win.location.reload();
        });
      }
      slow.hidden = false;
    },
    Math.max(0, SLOW_AFTER_MS - win.performance.now()),
  );
})(window, document);
