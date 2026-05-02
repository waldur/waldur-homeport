import {
  marketplaceProviderOfferingsUpdateLocation,
  Offering,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { GeolocationPoint } from '@/map/types';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

import { ARCHIVED } from '../../store/constants';

const SetLocationDialog = lazyComponent(() =>
  import('@/map/SetLocationDialog').then((module) => ({
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
  const { openDialog } = useModal();

  const { mutateAsync: updateLocation } = useManagedMutation<
    any,
    any,
    GeolocationPoint
  >({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateLocation({
        path: { uuid: offering.uuid },
        body: formData,
      }),
    successMessage: translate('Location has been saved successfully.'),
    errorMessage: translate('Unable to save location.'),
    refetch,
  });

  const callback = () =>
    openDialog(SetLocationDialog, {
      resolve: {
        location: {
          latitude: offering.latitude,
          longitude: offering.longitude,
        },
        setLocationFn: updateLocation,
        label: translate('Location of {name} offering', {
          name: offering.name,
        }),
      },
      size: 'lg',
    });

  if (!user.is_staff) {
    return null;
  }
  if (offering.state === ARCHIVED) {
    return null;
  }
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
