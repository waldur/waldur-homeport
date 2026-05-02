import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customersPartialUpdate } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { GeolocationPoint } from '@/map/types';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer } from '@/workspace/selectors';
import { Customer } from '@/workspace/types';

const SetLocationDialog = lazyComponent(() =>
  import('@/map/SetLocationDialog').then((module) => ({
    default: module.SetLocationDialog,
  })),
);

interface SetLocationButtonProps {
  customer: Customer;
}

export const SetLocationButton: FC<SetLocationButtonProps> = ({ customer }) => {
  const dispatch = useDispatch();
  const { openDialog } = useModal();
  const currentCustomer = useSelector(getCustomer);

  const { mutateAsync: updateLocation } = useManagedMutation<
    any,
    any,
    GeolocationPoint
  >({
    mutationFn: (formData) =>
      customersPartialUpdate({
        path: { uuid: customer.uuid },
        body: {
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
      }),
    successMessage: translate('Location has been saved successfully.'),
    errorMessage: translate('Unable to save location.'),
    onSuccess: (response) => {
      if (customer.uuid === currentCustomer?.uuid) {
        dispatch(setCurrentCustomer(response.data));
      }
    },
  });

  return (
    <CompactEditButton
      variant="secondary"
      onClick={() => {
        openDialog(SetLocationDialog, {
          resolve: {
            location: {
              latitude: customer.latitude,
              longitude: customer.longitude,
            },
            setLocationFn: updateLocation,
            label: translate('Location of {name} organization', {
              name: customer.name,
            }),
          },
          size: 'lg',
        });
      }}
    />
  );
};
