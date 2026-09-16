import { CopyIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { SramProjectRule } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const SramRuleFormDialog = lazyComponent(() =>
  import('./SramRuleFormDialog').then((module) => ({
    default: module.SramRuleFormDialog,
  })),
);

interface SramRuleDuplicateButtonProps {
  row: SramProjectRule;
  refetch;
}

export const SramRuleDuplicateButton: FC<SramRuleDuplicateButtonProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const openDuplicateDialog = useCallback(
    () =>
      openDialog(SramRuleFormDialog, {
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
