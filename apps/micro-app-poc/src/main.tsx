import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import './tailwind.css';

// Same font files src/vendor.ts bundles for the main app, and the exact
// same reason: --waldur-font-family (see tailwind.css, App.tsx's
// initFontFamily calls) only sets a CSS custom property naming a font by
// family name — it doesn't make the browser able to render it. Without
// these @font-face declarations actually loaded, "Inter"/"Maven Pro" here
// silently fall through to the stack's next name (Helvetica, then the
// platform's generic sans-serif), which looks visibly different from the
// real Inter/Maven Pro typefaces. FONT_FAMILY has exactly these two
// choices (see src/SettingsDescription.ts's choice_field options), so
// both need to be loaded up front — this app doesn't know which one a
// given tenant configured until fetchRuntimeConfig() resolves.
import '@fontsource/inter/index.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/maven-pro/400.css';
import '@fontsource/maven-pro/500.css';
import '@fontsource/maven-pro/600.css';
import '@fontsource/maven-pro/700.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
