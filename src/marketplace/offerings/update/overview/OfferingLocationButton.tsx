import { useDispatch } from 'react-redux';
import {
  marketplaceProviderOfferingsUpdateLocation,
  Offering,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { translate } from '@waldur/i18n';
import { GeolocationPoint } from '@waldur/map/types';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

import { ARCHIVED } from '../../store/constants';

const SetLocationDialog = lazyComponent(() =>
  import('@waldur/map/SetLocationDialog').then((module) => ({
    default: module.SetLocationDialog,
  })),
);

export const OfferingLocationButton = ({
  offering,
  refetch,
}: {
  offering: Offering;
  refetch;
}) => {
  const user = useUser();
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(SetLocationDialog, {
        resolve: {
          location: {
            latitude: offering.latitude,
            longitude: offering.longitude,
          },
          setLocationFn: async (formData: GeolocationPoint) => {
            try {
              await marketplaceProviderOfferingsUpdateLocation({
                path: { uuid: offering.uuid },
                body: formData,
              });
              dispatch(
                showSuccess(translate('Location has been saved successfully.')),
              );
              refetch();
              dispatch(closeModalDialog());
            } catch (error) {
              dispatch(
                showErrorResponse(error, translate('Unable to save location.')),
              );
            }
          },
          label: translate('Location of {name} offering', {
            name: offering.name,
          }),
        },
        size: 'lg',
      }),
    );
  if (!user.is_staff) {
    return null;
  }
  if (offering.state === ARCHIVED) {
    return null;
  }
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
