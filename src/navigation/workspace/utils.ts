import { useDispatch, useSelector } from 'react-redux';

import { customerCreateDialog } from '@waldur/customer/create/actions';
import { canManageCustomer } from '@waldur/customer/create/selectors';
import { closeModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

export const useCreateOrganization = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const ownerCanManage = useSelector(canManageCustomer);
  const canCreateOrganization = user.is_staff || ownerCanManage;
  const createOrganization = () => {
    dispatch(closeModalDialog());
    dispatch(customerCreateDialog());
  };
  return [canCreateOrganization, createOrganization];
};
