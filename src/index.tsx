import { createRoot } from 'react-dom/client';

import './vendor';
// Establishes the `theme, base, bootstrap, utilities` layer order. It has
// to be imported here, from the entry module, rather than pulled in by
// whichever component happens to need a Tailwind class first: the Metronic
// stylesheet is injected at runtime as a separate <link> (src/theme/
// utils.ts's loadTheme) and declares `bootstrap` itself, and CSS layer
// order is fixed by whichever declaration the document sees first.
// Importing eagerly at the entry keeps this file's ordering ahead of it —
// via the explicit @layer statement in dev, and via the emitted blocks'
// own order in production, where the optimizer drops that now-redundant
// statement. See docs/tailwind-shadcn-migration-notes.md.
import './tailwind.css';
import './sass/noscript.scss';
import { Application } from './Application';

window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

const domNode = document.getElementById('react-root');
const root = createRoot(domNode);
root.render(<Application />);
