import { Button } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n/translate';
import { getSubResourcesOfferings } from '@waldur/marketplace/common/api';
import { OfferingLink } from '@waldur/marketplace/links/OfferingLink';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';
import { Resource } from '@waldur/resource/types';

interface AddResourceButtonProps {
  resource: Resource;
}

export const AddResourceButton = (props: AddResourceButtonProps) => {
  const { value, loading } = useAsync(
    () => getSubResourcesOfferings(props.resource.marketplace_resource_uuid),
    [props.resource],
  );

  const relatedOfferingUuid = value?.length
    ? value.find((offering) => offering.type === INSTANCE_TYPE).uuid
    : null;

  return loading ? (
    <Button variant="primary">
      <LoadingSpinnerIcon className="p-2" />
    </Button>
  ) : (
    relatedOfferingUuid && (
      <OfferingLink
        offering_uuid={relatedOfferingUuid}
        className="btn btn-primary"
      >
        <i className="fa fa-plus" /> {translate('Add resource')}
      </OfferingLink>
    )
  );
};
