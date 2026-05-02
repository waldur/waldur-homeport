import { QuestionIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ArrowHowItWorksDialog = lazyComponent(() =>
  import('./ArrowHowItWorksDialog').then((m) => ({
    default: m.ArrowHowItWorksDialog,
  })),
);

export const ArrowHowItWorksButton = () => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      action={() =>
        openDialog(ArrowHowItWorksDialog, {
          size: 'xl',
        })
      }
      title={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
    />
  );
};
