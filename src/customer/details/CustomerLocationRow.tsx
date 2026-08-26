import { XIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import { customersPartialUpdate } from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { formatCoordinates } from '@/map/coordinates';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
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
            <ActionButton
              iconNode={
                !isPending ? (
                  <TrashIcon weight="bold" className="text-danger" />
                ) : (
                  <Spinner className="animation-spin" />
                )
              }
              action={mutate}
              variant="secondary"
              className="btn-sm btn-icon me-3"
            />

            <SetLocationButton customer={customer} />
          </>
        ) : null
      }
    />
  );
};
