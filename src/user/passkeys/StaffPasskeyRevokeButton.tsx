import { FunctionComponent, useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

const StaffPasskeyRevokeDialog = lazyComponent(() =>
  import('./StaffPasskeyRevokeDialog').then((module) => ({
    default: module.StaffPasskeyRevokeDialog,
  })),
);

/**
 * Opens a dialog rather than a confirm prompt, because the reason is
 * mandatory: taking away somebody else's authenticator is something they will
 * need explained, and the audit event is the only place that explanation
 * lives.
 */
export const StaffPasskeyRevokeButton: FunctionComponent<{ row; refetch? }> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const open = useCallback(
    () => openDialog(StaffPasskeyRevokeDialog, { resolve: { row, refetch } }),
    [openDialog, row, refetch],
  );

  return <RemovalActionItem title={translate('Revoke')} action={open} />;
};
