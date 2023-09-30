import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { customerCreateDialog } from '@waldur/customer/create/actions';
import { canCreateOrganization } from '@waldur/customer/create/selectors';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

export const CustomerCreateButton: FunctionComponent = () => {
  const dispatch = useDispatch();
  const isVisible = useSelector(canCreateOrganization);
  if (!isVisible) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Add organization')}
      action={() => dispatch(customerCreateDialog())}
      icon="fa fa-plus"
      variant="primary"
    />
  );
};
