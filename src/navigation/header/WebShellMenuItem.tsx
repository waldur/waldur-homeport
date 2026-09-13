import { FunctionComponent, useRef } from 'react';
import { WebShellTicket, webShellTicket } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { NavMenuItem } from '@/navigation/NavMenu';
import { useUser } from '@/workspace/hooks';

const createWebShellTicket = () => webShellTicket().then(({ data }) => data);

/**
 * Opens `waldur shell` in a new tab for staff. The backend reports the web
 * shell as enabled only when it runs with DEBUG, so production never shows it.
 * The returned link carries a single-use ticket in its fragment.
 */
export const WebShellMenuItem: FunctionComponent = () => {
  const user = useUser();
  // The tab is opened in the click handler: browsers allow new tabs only
  // during the user's gesture, which is over by the time the ticket arrives.
  const tabRef = useRef<Window | null>(null);
  const { mutate, isPending } = useManagedMutation<WebShellTicket, any, void>({
    mutationFn: createWebShellTicket,
    errorMessage: translate('Unable to open the web shell.'),
    onSuccess: ({ url }) => {
      const tab = tabRef.current;
      tabRef.current = null;
      if (tab && !tab.closed) {
        tab.location.href = url;
      } else {
        // The tab was blocked or closed meanwhile; this attempt may be blocked too.
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: () => {
      tabRef.current?.close();
      tabRef.current = null;
    },
  });

  if (!user?.is_staff || !ENV.plugins.WALDUR_CORE.WEB_SHELL_ENABLED) {
    return null;
  }

  return (
    <NavMenuItem
      // Keep the menu open until the ticket arrives: closing it would unmount
      // this item while the request is still in flight.
      onSelect={(event) => {
        event.preventDefault();
        const tab = window.open('', '_blank');
        if (tab) {
          // Cut the link back to Waldur before the tab loads the web shell.
          tab.opener = null;
        }
        tabRef.current = tab;
        mutate();
      }}
      disabled={isPending}
    >
      <span className="menu-title">{translate('Web shell')}</span>
    </NavMenuItem>
  );
};
