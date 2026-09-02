import { FunctionComponent } from 'react';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { NavMenuItem } from '@/navigation/NavMenu';

/**
 * asChild composes the real navigation Link as the row itself — same
 * reasoning as every other link-shaped menu row in this migration (see
 * OpenPublicOffering.tsx / MatrixChatHeader.tsx / InvoicePayButton.tsx).
 * No separate onSelect needed: Link's own onClick already drives the
 * uirouter transition, and Radix closes the menu on selection by default.
 */
export const LogoutMenuItem: FunctionComponent = () => (
  <NavMenuItem asChild>
    <Link state="logout" aria-hidden="true" label={translate('Log out')} />
  </NavMenuItem>
);
