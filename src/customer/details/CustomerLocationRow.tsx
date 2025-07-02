import { CheckIcon, XIcon, TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { Customer } from '@waldur/workspace/types';

import { SetLocationButton } from '../list/SetLocationButton';

export const CustomerLocationRow: FC<{ customer: Customer; callback }> = ({
  customer,
  callback,
}) => {
  const dispatch = useDispatch();

  const { mutate: removeLocation, isPending: isRemovingLocation } = useMutation(
    {
      mutationFn: async () => {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate('Are you sure you want to remove the location?'),
          );
        } catch {
          return;
        }

        try {
          await callback({ latitude: null, longitude: null }, dispatch);
          dispatch(showSuccess(translate('Location has been removed.')));
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to remove the location.')),
          );
        }
      },
    },
  );

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
        <>
          <ActionButton
            iconNode={
              !isRemovingLocation ? (
                <TrashIcon weight="bold" className="text-danger" />
              ) : (
                <Spinner className="animation-spin" />
              )
            }
            action={removeLocation}
            variant="secondary"
            className="btn-sm btn-icon me-3"
          />

          <SetLocationButton customer={customer} />
        </>
      }
    />
  );
};
