import { QuestionIcon } from '@phosphor-icons/react';
import { CallCoiConfiguration } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const COISummaryDialog = lazyComponent(() =>
  import('./COISummaryDialog').then((m) => ({ default: m.COISummaryDialog })),
);

interface COISummaryButtonProps {
  config: CallCoiConfiguration;
}

export const COISummaryButton = ({ config }: COISummaryButtonProps) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() =>
        openDialog(COISummaryDialog, {
          resolve: { config },
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
