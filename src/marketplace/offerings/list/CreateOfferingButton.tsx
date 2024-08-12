import { Plus } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const OfferingCreateDialog = lazyComponent(
  () => import('../actions/OfferingCreateDialog'),
  'OfferingCreateDialog',
);

export const CreateOfferingButton = ({ fetch }: { fetch? }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);

  const callback = () => {
    dispatch(openModalDialog(OfferingCreateDialog, { resolve: { fetch } }));
  };

  if (
    customer?.is_service_provider &&
    hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING,
      customerId: customer.uuid,
    })
  ) {
    return (
      <Button className="btn btn-success btn-md" onClick={callback}>
        <span className="svg-icon svg-icon-2">
          <Plus />
        </span>{' '}
        {translate('Add new offering')}
      </Button>
    );
  } else {
    return null;
  }
};
