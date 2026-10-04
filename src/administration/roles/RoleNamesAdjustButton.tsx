import { TagIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const RoleNamesAdjustDialog = lazyComponent(() =>
  import('./RoleNamesAdjustDialog').then((module) => ({
    default: module.RoleNamesAdjustDialog,
  })),
);

export const RoleNamesAdjustButton = ({ refetch }) => {
  const { openDialog } = useModal();

  return (
    <BaseButton
      label={translate('Adjust names')}
      iconNode={<TagIcon weight="bold" />}
      onClick={() =>
        openDialog(RoleNamesAdjustDialog, { resolve: { refetch } })
      }
      variant="tertiary"
    />
  );
};
