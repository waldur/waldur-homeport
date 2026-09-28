import { QuestionIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const MatrixHowItWorksDialog = lazyComponent(() =>
  import('./MatrixHowItWorksDialog').then((m) => ({
    default: m.MatrixHowItWorksDialog,
  })),
);

export const MatrixHowItWorksButton = () => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() => openDialog(MatrixHowItWorksDialog, { size: 'xl' })}
      label={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
