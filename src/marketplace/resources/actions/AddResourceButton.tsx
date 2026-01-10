import { PlusCircleIcon } from '@phosphor-icons/react';
import { useAsync } from 'react-use';
import { marketplaceProviderResourcesOfferingForSubresourcesList } from 'waldur-js-client';

import { translate } from '@waldur/i18n/translate';
import { OfferingLink } from '@waldur/marketplace/links/OfferingLink';
import { Resource } from '@waldur/resource/types';
import { ActionButton } from '@waldur/table/ActionButton';

interface AddResourceButtonProps {
  resource: Resource;
  offeringType: string;
}

export const AddResourceButton = (props: AddResourceButtonProps) => {
  const { value, loading } = useAsync(
    () =>
      marketplaceProviderResourcesOfferingForSubresourcesList({
        path: { uuid: props.resource.marketplace_resource_uuid },
      }).then((r) => r.data),
    [props.resource],
  );

  const relatedOfferingUuid = value?.length
    ? value.find((offering) => offering.type === props.offeringType).uuid
    : null;

  return loading ? (
    <ActionButton variant="primary" pending action={() => {}} />
  ) : (
    relatedOfferingUuid && (
      <OfferingLink
        offering_uuid={relatedOfferingUuid}
        className="btn btn-primary"
      >
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>
        {translate('Add resource')}
      </OfferingLink>
    )
  );
};
