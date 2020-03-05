import { CustomerActionsProps } from './types';

export const checkPermissions = (props: CustomerActionsProps) => {
  const isStaff = props.user.is_staff;
  const isOwner = props.customer.owners.find(
    owner => owner.uuid === props.user.uuid,
  );
  return isStaff || isOwner;
};
