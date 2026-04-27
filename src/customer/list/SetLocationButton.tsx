import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customersPartialUpdate } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { GeolocationPoint } from '@/map/types';
import { closeModalDialog, openModalDialog } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';
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

interface SetLocationPayload {
  uuid: string;
  latitude: number;
  longitude: number;
}

export const SetLocationButton: FC<SetLocationButtonProps> = ({ customer }) => {
  const dispatch = useDispatch();
  const currentCustomer = useSelector(getCustomer);
  const setOrganizationLocation = async (payload: SetLocationPayload) => {
    try {
      const response = await customersPartialUpdate({
        path: { uuid: payload.uuid },
        body: {
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      });
      dispatch(showSuccess(translate('Location has been saved successfully.')));
      dispatch(closeModalDialog());
      if (customer.uuid === currentCustomer?.uuid) {
        dispatch(setCurrentCustomer(response.data));
      }
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to save location.')));
    }
  };

  return (
    <CompactEditButton
      variant="secondary"
      onClick={() => {
        dispatch(
          openModalDialog(SetLocationDialog, {
            resolve: {
              location: {
                latitude: customer.latitude,
                longitude: customer.longitude,
              },
              setLocationFn: (formData: GeolocationPoint) =>
                setOrganizationLocation({ uuid: customer.uuid, ...formData }),
              label: translate('Location of {name} organization', {
                name: customer.name,
              }),
            },
            size: 'lg',
          }),
        );
      }}
    />
  );
};
