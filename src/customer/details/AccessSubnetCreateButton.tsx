import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const AccessSubnetCreateForm = lazyComponent(
  () => import('./AccessSubnetCreateForm'),
  'AccessSubnetCreateForm',
);

const AccessSubnetCreateDialog = (refetch, customer_uuid) =>
  openModalDialog(AccessSubnetCreateForm, {
    refetch: refetch,
    customer_uuid,
    size: 'md',
  });

export const AccessSubnetCreateButton = ({ refetch, customer_uuid }) => {
  const dispatch = useDispatch();

  const openFormDialog = useCallback(
    () => dispatch(AccessSubnetCreateDialog(refetch, customer_uuid)),
    [dispatch],
  );

  return (
    <ActionButton
      title={translate('Add access subnet')}
      action={openFormDialog}
      icon="fa fa-plus"
      variant="primary"
    />
  );
};
