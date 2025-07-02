import { useAsync } from 'react-use';
import { openstackVolumeTypesRetrieve } from 'waldur-js-client';
import { OrderDetails } from 'waldur-js-client';

import { formatFilesize, getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { formatVolumeTypeLabel } from '../openstack-instance/utils';

interface OpenstackVolumeDetailsProps {
  order: OrderDetails;
}

export const OpenstackVolumeDetails = (props: OpenstackVolumeDetailsProps) => {
  const { order } = props;
  const { value: volumeType } = useAsync(() =>
    order.attributes['type']
      ? openstackVolumeTypesRetrieve(getUUID(order.attributes['type'])).then(
          (response) => response.data,
        )
      : Promise.resolve(null),
  );
  return (
    <>
      <Field label={translate('Size')}>
        {formatFilesize(props.order.attributes['size'])}
      </Field>
      {typeof order.attributes['availability_zone_name'] === 'string' && (
        <Field label={translate('Availability zone')}>
          {order.attributes['availability_zone_name']}
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
