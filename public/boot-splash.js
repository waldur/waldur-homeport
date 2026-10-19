// Brands the boot splash before its first paint.
//
// Served from public/ as a plain classic script for the same reason as
// boot-redirect.js: production ingresses send `script-src 'self'`, so no
// inline block. It sits in <head> and is neither deferred nor async, so it
// runs before the browser parses, let alone paints, the splash in <body>.
// It therefore cannot touch the splash itself. It sets what the splash's
// styles in index.html read instead: the theme, and the brand colour, logo
// and name as custom properties and attributes on <html>.
//
// The branding is whatever the previous visit stored under
// 'waldur/boot-splash' (written by saveSplashBranding() in
// src/core/splashBranding.ts once the configuration has loaded); the logo is
// stored as a small data: URI, so it is there in the very first frame. A
// first visit, or blocked storage, keeps the Waldur defaults in the markup.
//
// The application mounts underneath this fixed splash; src/BootSplashGate.tsx
// removes it once the first page is ready, and LoadingScreen is only shown
// if the application fails to boot.
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

  // A CSS string for `content: var(--boot-name)`.
  function cssString(text) {
    return '"' + text.replace(/[\\"\n\r\f]/g, ' ') + '"';
  }

  var branding = null;
  try {
    branding = JSON.parse(stored('waldur/boot-splash'));
  } catch {
    branding = null;
  }

  // Same rule as getInitialTheme() in src/theme/utils.ts, applied early so
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
    if (typeof branding.name === 'string' && branding.name) {
      root.style.setProperty('--boot-name', cssString(branding.name));
      root.setAttribute('data-boot-name', '');

      // Once DOM is parsed, keep accessible text and aria-label in sync with
      // the branded name for screen readers (CSS ::after is visual-only).
      doc.addEventListener('DOMContentLoaded', function () {
        var splash = doc.getElementById('boot-splash');
        if (splash) {
          splash.setAttribute('aria-label', 'Starting ' + branding.name);
        }
        var spans = doc.querySelectorAll(
          '.boot-splash--static .boot-splash__brand > span',
        );
        for (var i = 0; i < spans.length; i++) {
          spans[i].textContent = branding.name;
        }
      });
    }
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
