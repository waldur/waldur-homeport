import { AdminAnnouncements } from '@/navigation/header/announcements/AdminAnnouncements';

import type { LandingPageLayout } from './layouts/types';

/**
 * Layouts with a separate sign-in column render the bars at the top of that
 * column; the rest get them at the top of the page (see LandingPage).
 */
export const LAYOUTS_WITH_FORM_COLUMN: ReadonlySet<LandingPageLayout> = new Set(
  ['split-screen', 'right-split', 'news', 'carousel', 'duotone', 'stats'],
);

/** Active announcements published to signed-out visitors, tinted so they
 * stand out on the login page. A failed load renders nothing. */
export const LoginAnnouncementBars = () => (
  <AdminAnnouncements colored hideError />
);
