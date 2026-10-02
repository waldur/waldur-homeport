import { FC } from 'react';
import { Offering, Resource } from 'waldur-js-client';

import { ResourceApiKeysCard } from './ResourceApiKeysCard';
import { useResourceApiKeysTable } from './useResourceApiKeys';

/**
 * The resource's API keys — one home for every backend that reports them
 * (croit-s3 S3 access keys, Envoy inference keys). The tab itself is mounted
 * from the resource's has_api_keys flag, so nothing here is backend-specific.
 * The offering rides along with the page data so the card can label each key's
 * limits and usage with the component they are metered against.
 */
export const ResourceApiKeysTab: FC<{
  resource: Resource;
  offering?: Offering;
}> = ({ resource, offering }) => {
  const tableProps = useResourceApiKeysTable(resource);
  return (
    <ResourceApiKeysCard
      {...tableProps}
      resource={resource}
      offering={offering}
    />
  );
};
