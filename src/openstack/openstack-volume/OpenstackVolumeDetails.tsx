import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { DetailsField } from '@waldur/marketplace/common/DetailsField';
import { OrderResponse } from '@waldur/marketplace/orders/types';

import { formatVolumeTypeLabel } from '../openstack-instance/utils';
import { VolumeType } from '../types';

const formatSize = (props) => {
  return formatFilesize(props.order.attributes.size);
};

export interface OpenstackVolumeDetailsProps {
  order: OrderResponse;
}

export const OpenstackVolumeDetails = (props: OpenstackVolumeDetailsProps) => {
  const { order } = props;
  const { value: volumeType } = useAsync(() =>
    order.attributes.type
      ? get<VolumeType>(order.attributes.type).then((response) => response.data)
      : Promise.resolve(null),
  );
  return (
    <>
      <DetailsField label={translate('Size')}>{formatSize(props)}</DetailsField>
      {order.attributes.availability_zone_name && (
        <DetailsField label={translate('Availability zone')}>
          {order.attributes.availability_zone_name}
        </DetailsField>
      )}
      {volumeType && (
        <DetailsField label={translate('Volume type')}>
          {formatVolumeTypeLabel(volumeType)}
        </DetailsField>
      )}
    </>
  );
};
