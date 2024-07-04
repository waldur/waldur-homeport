import { PencilSimple } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

interface OrganizationEditButtonProps {
  customer: Customer;
}

export const OrganizationEditButton: FunctionComponent<
  OrganizationEditButtonProps
> = (props) => {
  const router = useRouter();
  const user = useSelector(getUser);
  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_CUSTOMER,
      customerId: props.customer.uuid,
    })
  ) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Edit')}
      iconNode={<PencilSimple />}
      className="btn-active-primary ms-3"
      action={() =>
        router.stateService.go('organization-manage', {
          uuid: props.customer.uuid,
        })
      }
    />
  );
};
