import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditRoleDialog = lazyComponent(() =>
  import('./EditRoleDialog').then((module) => ({
    default: module.EditRoleDialog,
  })),
);

export const EditRoleAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        dispatch(
          openModalDialog(EditRoleDialog, {
            resolve: { row, refetch },
          }),
        )
      }
    />
  );
};
