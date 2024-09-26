import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { OrderResponse } from '@waldur/marketplace/orders/types';
import { Field } from '@waldur/resource/summary';

import { formatVolumeTypeLabel } from '../openstack-instance/utils';
import { VolumeType } from '../types';

const formatSize = (props) => {
  return formatFilesize(props.order.attributes.size);
};

interface OpenstackVolumeDetailsProps {
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
      <Field label={translate('Size')}>{formatSize(props)}</Field>
      {order.attributes.availability_zone_name && (
        <Field label={translate('Availability zone')}>
          {order.attributes.availability_zone_name}
        </Field>
      )}
      {volumeType && (
        <Field label={translate('Volume type')}>
          {formatVolumeTypeLabel(volumeType)}
        </Field>
      )}
    </>
  );
};
