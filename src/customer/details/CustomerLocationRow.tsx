import { CheckIcon, XIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';
import { Customer } from '@/workspace/types';

import { SetLocationButton } from '../list/SetLocationButton';

export const CustomerLocationRow: FC<{
  customer: Customer;
  callback;
  canUpdate?: boolean;
}> = ({ customer, callback, canUpdate }) => {
  const dispatch = useDispatch();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => callback({ latitude: null, longitude: null }, dispatch),
    successMessage: translate('Location has been removed.'),
    errorMessage: translate('Unable to remove the location.'),
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to remove the location?'),
    },
  });

  return (
    <FormTable.Item
      label={translate('Location')}
      value={
        customer.latitude && customer.longitude ? (
          <CheckIcon weight="bold" className="text-info" />
        ) : (
          <XIcon weight="bold" className="text-danger" />
        )
      }
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
