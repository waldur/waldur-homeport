import { ArrowsLeftRightIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { RoleDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RoleComparisonDialog = lazyComponent(() =>
  import('./RoleComparisonDialog').then((module) => ({
    default: module.RoleComparisonDialog,
  })),
);

export const RoleCompareButton: FC<{ row: RoleDetails }> = ({ row }) => {
  const { openDialog } = useModal();
  const open = useCallback(
    () =>
      openDialog(RoleComparisonDialog, {
        resolve: { role: row },
        size: 'lg',
      }),
    [openDialog, row],
  );
  return (
    <ActionItem
      title={translate('Compare permissions')}
      action={open}
      iconNode={<ArrowsLeftRightIcon weight="bold" />}
    />
  );
};
