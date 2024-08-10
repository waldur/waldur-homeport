import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const UserDetailsDialog = lazyComponent(
  () => import('./UserDetailsDialog'),
  'UserDetailsDialog',
);

export const UserDetailsButton: FunctionComponent<{ row }> = ({ row }) => {
  const dispatch = useDispatch();
  return (
    <RowActionButton
      title={translate('Details')}
      size="sm"
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
