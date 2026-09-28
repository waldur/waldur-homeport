import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceResourcesOfferingForSubresourcesList } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n/translate';
import { OfferingLink } from '@/marketplace/links/OfferingLink';
import { Resource } from '@/resource/types';

interface AddResourceButtonProps {
  resource: Resource;
  offeringType: string;
}

export const AddResourceButton = (props: AddResourceButtonProps) => {
  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['AddResourceButton', props.resource],

    queryFn: () =>
      marketplaceResourcesOfferingForSubresourcesList({
        path: { uuid: props.resource.marketplace_resource_uuid },
      }).then((r) => r.data),
  });

  const relatedOfferingUuid =
    value?.find((offering) => offering.type === props.offeringType)?.uuid ??
    null;

  return loading ? (
    <BaseButton variant="primary" pending onClick={() => {}} size="lg" />
  ) : (
    relatedOfferingUuid && (
      <OfferingLink offering_uuid={relatedOfferingUuid} buttonVariant="primary">
        <PlusCircleIcon size={20} weight="bold" />
        {translate('Add resource')}
      </OfferingLink>
    )
  );
};
