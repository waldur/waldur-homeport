import { QuestionIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const PoolSummaryDialog = lazyComponent(() =>
  import('./PoolSummaryDialog').then((m) => ({
    default: m.PoolSummaryDialog,
  })),
);

export const PoolSummaryButton = () => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() =>
        openDialog(PoolSummaryDialog, {
          size: 'xl',
        })
      }
      label={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
