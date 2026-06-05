import { QuestionIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const MatrixHowItWorksDialog = lazyComponent(() =>
  import('./MatrixHowItWorksDialog').then((m) => ({
    default: m.MatrixHowItWorksDialog,
  })),
);

export const MatrixHowItWorksButton = () => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      action={() => openDialog(MatrixHowItWorksDialog, { size: 'xl' })}
      title={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
    />
  );
};
