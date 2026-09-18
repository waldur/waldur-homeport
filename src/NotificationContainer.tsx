import { CSSProperties, FunctionComponent } from 'react';
import { Toaster } from 'sonner';

// Sonner's own stylesheet sets --width to 356px and z-index to 999999999, and
// lands after ours, so both have to be inline. See --z-index-toast in
// tailwind.css for why the z-index sits below tooltips.
const TOASTER_STYLE = {
  '--width': '400px',
  zIndex: 'var(--z-index-toast)',
} as CSSProperties;

/** Mounts the toast stack; Sonner handles only position, stacking and timing. */
export const NotificationContainer: FunctionComponent = () => (
  <Toaster
    position="top-right"
    expand
    gap={12}
    offset={24}
    // Sonner shows 3 at a time by default and silently expires the rest —
    // bulk actions report one error per failed item, so raise the ceiling.
    visibleToasts={9}
    style={TOASTER_STYLE}
    toastOptions={{ unstyled: true }}
  />
);
