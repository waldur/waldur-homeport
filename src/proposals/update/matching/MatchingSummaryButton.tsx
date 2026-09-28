import { QuestionIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import type { MatchingConfig } from './types';

const MatchingSummaryDialog = lazyComponent(() =>
  import('./MatchingSummaryDialog').then((m) => ({
    default: m.MatchingSummaryDialog,
  })),
);

interface MatchingSummaryButtonProps {
  config: MatchingConfig;
}

export const MatchingSummaryButton = ({
  config,
}: MatchingSummaryButtonProps) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() =>
        openDialog(MatchingSummaryDialog, {
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
