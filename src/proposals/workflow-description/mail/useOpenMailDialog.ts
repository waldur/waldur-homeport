import { useRouter } from '@uirouter/react';
import { useCallback, useRef } from 'react';

import { useModal } from '@/modal/actions';

import { MailDialog } from './MailDialog';
import { CALL_MAIL_STATE, mailPageParams } from './mailPage';
import { MailTarget } from './queries';

/**
 * Opens one mail of the call: its preview in a dialog, or, to change its
 * rules or wording, its page in a new browser tab. A no-op without a call.
 *
 * The opener keeps its identity while a dialog opens and closes (the modal's
 * `openDialog` does not): a table whose cells are built from it would
 * otherwise remount them, and the button focused when the dialog opened
 * would be gone when it closes.
 */
export const useOpenMailDialog = (callUuid?: string) => {
  const { openDialog } = useModal();
  const router = useRouter();
  const openRef = useRef(openDialog);
  openRef.current = openDialog;
  return useCallback(
    (target: MailTarget, tab?: 'preview' | 'rule' | 'customise') => {
      if (!callUuid) return;
      if (tab === 'rule' || tab === 'customise') {
        // In a new browser tab: these are asked for from the step dialog,
        // whose unsaved changes leaving the page would throw away.
        window.open(
          router.stateService.href(CALL_MAIL_STATE, {
            call_uuid: callUuid,
            ...mailPageParams(target),
            tab: tab === 'rule' ? 'rules' : 'wording',
          }),
          '_blank',
          'noopener',
        );
        return;
      }
      openRef.current(MailDialog, {
        resolve: { callUuid, target },
        size: 'xl',
      });
    },
    [callUuid, router],
  );
};
