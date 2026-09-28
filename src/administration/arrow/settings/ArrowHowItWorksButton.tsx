import { QuestionIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const ArrowHowItWorksDialog = lazyComponent(() =>
  import('./ArrowHowItWorksDialog').then((m) => ({
    default: m.ArrowHowItWorksDialog,
  })),
);

export const ArrowHowItWorksButton = () => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() =>
        openDialog(ArrowHowItWorksDialog, {
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
