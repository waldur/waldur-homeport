import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const RoleDescriptionEditDialog = lazyComponent(() =>
  import('./RoleDescriptionEditDialog').then((module) => ({
    default: module.RoleDescriptionEditDialog,
  })),
);

export const RoleDescriptionEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openRoleEditDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleDescriptionEditDialog, {
          resolve: {
            row,
            refetch,
          },
        }),
      ),
    [dispatch],
  );

  return (
    <ActionItem
      title={translate('Edit descriptions')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openRoleEditDialog}
    />
  );
};
