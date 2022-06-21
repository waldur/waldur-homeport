import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import { formatVolumeTypeLabel } from '../openstack-instance/utils';
import { VolumeType } from '../types';

const formatSize = (props) => {
  return formatFilesize(props.orderItem.attributes.size);
};

export interface OpenstackVolumeDetailsProps {
  orderItem: OrderItemResponse;
}

export const OpenstackVolumeDetails = (props: OpenstackVolumeDetailsProps) => {
  const { orderItem } = props;
  const { value: volumeType } = useAsync(() =>
    get<VolumeType>(orderItem.attributes.type).then(
      (response) => response.data,
    ),
  );
  return (
    <>
      <OrderItemDetailsField label={translate('Size')}>
        {formatSize(props)}
      </OrderItemDetailsField>
      {orderItem.attributes.availability_zone_name && (
        <OrderItemDetailsField label={translate('Availability zone')}>
          {orderItem.attributes.availability_zone_name}
        </OrderItemDetailsField>
      )}
      {volumeType && (
        <OrderItemDetailsField label={translate('Volume type')}>
          {formatVolumeTypeLabel(volumeType)}
        </OrderItemDetailsField>
      )}
    </>
  );
};
