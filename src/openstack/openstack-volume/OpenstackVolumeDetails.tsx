import { useQuery } from '@tanstack/react-query';
import { openstackVolumeTypesRetrieve } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { OrderDetailsProps } from '@/marketplace/types';
import { propVal } from '@/property/propertyFields';

import { formatVolumeTypeLabel } from '../openstack-instance/utils';

export const OpenstackVolumeDetails = (props: OrderDetailsProps) => {
  const { order } = props;
  const { data: volumeType } = useQuery({
    queryKey: ['OpenstackVolumeDetails'],

    queryFn: () =>
      order.attributes['type']
        ? openstackVolumeTypesRetrieve(getUUID(order.attributes['type'])).then(
            (response) => response.data,
          )
        : Promise.resolve(null),
  });
  return (
    <>
      <PropertyItem
        label={translate('Size')}
        value={propVal.fileSize(
          props.order.attributes['size'] as number | string,
          { unit: 'MB' },
        )}
        hideIfEmpty={false}
      />
      {typeof order.attributes['availability_zone_name'] === 'string' && (
        <PropertyItem
          label={translate('Availability zone')}
          value={order.attributes['availability_zone_name']}
        />
      )}
      {volumeType && (
        <PropertyItem label={translate('Volume type')}>
          {formatVolumeTypeLabel(volumeType)}
        </PropertyItem>
      )}
    </>
  );
};
