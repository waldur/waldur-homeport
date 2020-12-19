import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

interface OrganizationEditButtonProps {
  customer: Customer;
}

export const OrganizationEditButton: FunctionComponent<OrganizationEditButtonProps> = (
  props,
) => {
  const router = useRouter();
  return (
    <ActionButton
      title={translate('Edit')}
      icon="fa fa-edit"
      action={() =>
        router.stateService.go('support.customer-update', {
          customer_uuid: props.customer.uuid,
        })
      }
    />
  );
};
