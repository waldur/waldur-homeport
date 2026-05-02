import { QuestionIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const PoolSummaryDialog = lazyComponent(() =>
  import('./PoolSummaryDialog').then((m) => ({
    default: m.PoolSummaryDialog,
  })),
);

export const PoolSummaryButton = () => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      action={() =>
        openDialog(PoolSummaryDialog, {
          size: 'xl',
        })
      }
      title={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
    />
  );
};
