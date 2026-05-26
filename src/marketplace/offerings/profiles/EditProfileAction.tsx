import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const OfferingProfileForm = lazyComponent(() =>
  import('./OfferingProfileForm').then((module) => ({
    default: module.OfferingProfileForm,
  })),
);

export const EditProfileAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        openDialog(OfferingProfileForm, {
          resolve: { profile: row, refetch },
        })
      }
    />
  );
};
