import { useQuery } from '@tanstack/react-query';
import { openstackVolumeTypesRetrieve } from 'waldur-js-client';

import { formatFilesize, getUUID } from '@/core/utils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { OrderDetailsProps } from '@/marketplace/types';

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
      <FormTable.Item label={translate('Size')}>
        {formatFilesize(props.order.attributes['size'])}
      </FormTable.Item>
      {typeof order.attributes['availability_zone_name'] === 'string' && (
        <FormTable.Item label={translate('Availability zone')}>
          {order.attributes['availability_zone_name']}
        </FormTable.Item>
      )}
      {volumeType && (
        <FormTable.Item label={translate('Volume type')}>
          {formatVolumeTypeLabel(volumeType)}
        </FormTable.Item>
      )}
    </>
  );
};
