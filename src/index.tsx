import { createRoot } from 'react-dom/client';

import './vendor';
// Establishes the `theme, base, bootstrap, utilities` layer order. It has
// to be imported here, from the entry module, and before the Metronic
// stylesheet: that declares `bootstrap` itself, and CSS layer order is fixed
// by whichever declaration the document sees first. Importing it first keeps
// this file's ordering ahead — via the explicit @layer statement in dev, and
// via the emitted blocks' own order in production, where the optimizer drops
// that now-redundant statement. See docs/tailwind-shadcn-migration-notes.md.
import './tailwind.css';
import './metronic/sass/style.scss';
import './sass/noscript.scss';
import { Application } from './Application';
import {
  isLeavingForIdentityProvider,
  reloadAfterPreloadError,
} from './core/bootGuard';

window.addEventListener('vite:preloadError', () => {
  reloadAfterPreloadError();
});

isLeavingForIdentityProvider().then((leaving) => {
  if (leaving) {
    return;
  }
  const domNode = document.getElementById('react-root');
  const root = createRoot(domNode);
  root.render(<Application />);
});
