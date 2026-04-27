import { QuestionIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

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
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(MatchingSummaryDialog, {
            resolve: { config },
            size: 'xl',
          }),
        )
      }
      title={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
    />
  );
};
