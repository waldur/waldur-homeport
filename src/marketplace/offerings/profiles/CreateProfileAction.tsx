import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const OfferingProfileForm = lazyComponent(() =>
  import('./OfferingProfileForm').then((module) => ({
    default: module.OfferingProfileForm,
  })),
);

interface CreateProfileActionProps {
  refetch(): void;
}

export const CreateProfileAction: FC<CreateProfileActionProps> = ({
  refetch,
}) => {
  const { openDialog } = useModal();

  return (
    <BaseButton
      label={translate('Create profile')}
      iconNode={<PlusCircleIcon weight="bold" />}
      onClick={() =>
        openDialog(OfferingProfileForm, {
          resolve: { refetch },
        })
      }
      variant="tertiary"
      size="lg"
    />
  );
};
