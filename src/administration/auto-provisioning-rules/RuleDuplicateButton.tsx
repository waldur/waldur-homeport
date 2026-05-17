import { CopyIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Rule } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RuleFormDialog = lazyComponent(() =>
  import('./RuleFormDialog').then((module) => ({
    default: module.RuleFormDialog,
  })),
);

interface RuleDuplicateButtonProps {
  row: Rule;
  refetch;
}

export const RuleDuplicateButton: FC<RuleDuplicateButtonProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const openDuplicateDialog = useCallback(
    () =>
      openDialog(RuleFormDialog, {
        resolve: { refetch, rule: row, isDuplicate: true },
      }),
    [row, refetch, openDialog],
  );

  return (
    <ActionItem
      title={translate('Duplicate')}
      action={openDuplicateDialog}
      iconNode={<CopyIcon weight="bold" />}
    />
  );
};
