import { CSSProperties, FunctionComponent } from 'react';

import { NotificationProvider } from 'waldur-notifications';

// See --z-index-toast in tailwind.css for why the z-index sits below
// tooltips — overriding waldur-ui's ToastViewport's own generic z-50
// default, which knows nothing of this app's legacy Bootstrap z-index
// stack (Metronic's sidebar/drawer, Bootstrap modals, ...).
const VIEWPORT_STYLE = { zIndex: 'var(--z-index-toast)' } as CSSProperties;

/** Mounts the toast stack; see waldur-notifications for the store it renders. */
export const NotificationContainer: FunctionComponent = () => (
  <NotificationProvider viewportStyle={VIEWPORT_STYLE} />
);
