import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const UserDetailsDialog = lazyComponent(() =>
  import('./UserDetailsDialog').then((module) => ({
    default: module.UserDetailsDialog,
  })),
);

export const UserDetailsButton: FunctionComponent<{ row }> = ({ row }) => {
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Details')}
      size="sm"
      iconNode={<EyeIcon weight="bold" />}
      action={() =>
        dispatch(
          openModalDialog(UserDetailsDialog, {
            resolve: { user: row },
            size: 'lg',
          }),
        )
      }
    />
  );
};
