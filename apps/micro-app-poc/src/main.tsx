import React from 'react';
import ReactDOM from 'react-dom/client';
import { bootstrapMicroApp } from 'waldur-shell';

import { OrgDashboardMock } from './OrgDashboardMock';
import './tailwind.css';

// Same @font-face declarations src/vendor.ts bundles for the main app —
// see waldur-design-tokens/fonts.css's own comment for why both
// tenant-configurable FONT_FAMILY choices load unconditionally.
import 'waldur-design-tokens/fonts.css';

// Called at module scope, not inside a component — see bootstrapMicroApp()'s
// own comment on why that's sufficient (its synchronous half completes
// before this call returns; the rest is fire-and-forget). No arguments:
// every option defaults sensibly for an app with no special requirements
// (no router of its own, no Sentry DSN yet, no brand color override).
bootstrapMicroApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OrgDashboardMock />
  </React.StrictMode>,
);
