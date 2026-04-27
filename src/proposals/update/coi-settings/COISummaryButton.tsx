import { QuestionIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { CallCoiConfiguration } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const COISummaryDialog = lazyComponent(() =>
  import('./COISummaryDialog').then((m) => ({ default: m.COISummaryDialog })),
);

interface COISummaryButtonProps {
  config: CallCoiConfiguration;
}

export const COISummaryButton = ({ config }: COISummaryButtonProps) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(COISummaryDialog, {
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
