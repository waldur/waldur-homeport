import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { useSetCustomer } from '@/workspace/hooks';

import { getCustomer } from '../utils';

import { UpdateCustomerOrganizationsGroupsButton } from './UpdateCustomerOrganizationsGroupsButton';

export const CustomerOrganizationGroupsRow = (props) => {
  const setCurrentCustomer = useSetCustomer();

  const { showErrorResponse } = useNotify();

  const updateCustomerData = async () => {
    try {
      const currentCustomer = await getCustomer(props.customer.uuid);
      setCurrentCustomer(currentCustomer);
    } catch (error) {
      showErrorResponse(
        error,
        translate('Unable to update organization groups.'),
      );
    }
  };
  return (
    <FormTable.Item
      label={translate('Organization groups')}
      value={
        props.customer.organization_groups
          ?.map(
            (group) =>
              `${group.parent_name ? `${group.parent_name} ➔ ` : ''}${group.name}`,
          )
          .join(', ') || ''
      }
      actions={
        props.canUpdate ? (
          <UpdateCustomerOrganizationsGroupsButton
            customer={props.customer}
            refetch={updateCustomerData}
          />
        ) : null
      }
    />
  );
};
