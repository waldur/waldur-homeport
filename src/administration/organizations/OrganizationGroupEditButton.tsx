import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const OrganizationGroupEditDialog = lazyComponent(
  () => import('./OrganizationGroupFromDialog'),
  'OrganizationGroupFromDialog',
);

const organizationGroupEditDialog = (row, refetch) =>
  openModalDialog(OrganizationGroupEditDialog, {
    resolve: { organizationGroup: row, refetch },
    size: 'md',
  });

export const OrganizationGroupEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(organizationGroupEditDialog(row, refetch)),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('Edit')}
      action={openFormDialog}
      icon="fa fa-edit"
      variant="primary"
    />
  );
};
