import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

interface UserPermissionRequestReviewButtonProps {
  row: any;
  refetch;
  readOnly: boolean;
}

const PermissionRequestActionDialog = lazyComponent(() =>
  import('./PermissionRequestActionDialog').then((module) => ({
    default: module.PermissionRequestActionDialog,
  })),
);

export const UserPermissionRequestReviewButton: FunctionComponent<
  UserPermissionRequestReviewButtonProps
> = ({ row: permissionRequest, refetch, readOnly }) => {
  const dispatch = useDispatch();

  const callback = () => {
    dispatch(
      openModalDialog(PermissionRequestActionDialog, {
        resolve: { permissionRequest, readOnly, refetch },
        size: 'lg',
      }),
    );
  };

  return (
    <ActionItem
      action={callback}
      title={translate('Review')}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
