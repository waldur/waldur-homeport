import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

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
    <ActionButton
      title={translate('Create profile')}
      iconNode={<PlusCircleIcon weight="bold" />}
      action={() =>
        openDialog(OfferingProfileForm, {
          resolve: { refetch },
        })
      }
    />
  );
};
