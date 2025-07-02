import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customersPartialUpdate } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { translate } from '@waldur/i18n';
import { GeolocationPoint } from '@waldur/map/types';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

const SetLocationDialog = lazyComponent(() =>
  import('@waldur/map/SetLocationDialog').then((module) => ({
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
    <EditButton
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
      size="sm"
    />
  );
};
