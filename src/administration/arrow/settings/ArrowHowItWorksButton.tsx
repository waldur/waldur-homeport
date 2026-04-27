import { QuestionIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ArrowHowItWorksDialog = lazyComponent(() =>
  import('./ArrowHowItWorksDialog').then((m) => ({
    default: m.ArrowHowItWorksDialog,
  })),
);

export const ArrowHowItWorksButton = () => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(ArrowHowItWorksDialog, {
            size: 'xl',
          }),
        )
      }
      title={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
    />
  );
};
