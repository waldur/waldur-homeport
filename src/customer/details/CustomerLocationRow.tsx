import { XIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { customersPartialUpdate } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { formatCoordinates } from '@/map/coordinates';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCustomer, useSetCustomer } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { SetLocationButton } from '../list/SetLocationButton';

export const CustomerLocationRow: FC<{
  customer: Customer;
  canUpdate?: boolean;
}> = ({ customer, canUpdate }) => {
  const setCurrentCustomer = useSetCustomer();
  const currentCustomer = useCustomer();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      customersPartialUpdate({
        path: { uuid: customer.uuid },
        body: {
          latitude: null,
          longitude: null,
        },
      }),
    successMessage: translate('Location has been removed.'),
    errorMessage: translate('Unable to remove the location.'),
    onSuccess: (response) => {
      if (customer.uuid === currentCustomer?.uuid) {
        setCurrentCustomer(response.data);
      }
    },
    confirmation: {
      options: {
        forDeletion: true,
      },
      title: translate('Confirmation'),
      body: translate('Are you sure you want to remove the location?'),
    },
  });

  const coordinates = formatCoordinates(customer);

  return (
    <FormTable.Item
      label={translate('Location')}
      value={coordinates ?? <XIcon weight="bold" className="text-danger" />}
      actions={
        canUpdate ? (
          <>
            <BaseButton
              iconNode={<TrashIcon weight="bold" className="text-danger" />}
              onClick={mutate}
              variant="secondary"
              className="me-3"
              size="sm"
              pending={isPending}
              tooltip={translate('Remove')}
            />

            <SetLocationButton customer={customer} />
          </>
        ) : null
      }
    />
  );
};
