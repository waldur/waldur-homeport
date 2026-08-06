import { FC } from 'react';
import { NestedOfferingAccessSubnet } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

/**
 * Only the fields this component reads.
 *
 * Deliberately structural rather than one of the generated offering types: the
 * consumer-facing views feed it from the *public* offerings endpoint, whose
 * type is not the provider one, and both are narrowed by `field=` anyway.
 */
interface OfferingWithDefaults {
  uuid?: string;
  name?: string;
  default_access_subnets?: NestedOfferingAccessSubnet[];
}

interface ProviderDefaultSubnetsProps {
  offerings: OfferingWithDefaults[];
}

/**
 * Addresses the service provider publishes for its own offerings.
 *
 * Read-only on purpose: they widen what may reach the organization's resources
 * but belong to the provider, so a consumer can neither add nor remove them.
 * They are shown here because they are otherwise invisible from this page —
 * leaving the organization's own list looking like the whole picture when it
 * is not.
 */
export const ProviderDefaultSubnets: FC<ProviderDefaultSubnetsProps> = ({
  offerings,
}) => {
  const withDefaults = offerings.filter(
    (offering) => (offering.default_access_subnets ?? []).length > 0,
  );
  if (!withDefaults.length) {
    return null;
  }

  return (
    <div className="border-top p-6">
      <div className="fw-bold mb-1">
        {translate('Also allowed by the service provider')}
      </div>
      <div className="text-muted mb-4">
        {translate(
          'Published on the offering and applied to your resources of it. These cannot be changed here.',
        )}
      </div>
      {withDefaults.map((offering) => (
        <div key={offering.uuid} className="d-flex flex-wrap gap-2 mb-2">
          <span className="text-nowrap">{offering.name}</span>
          {(offering.default_access_subnets ?? []).map((subnet) => (
            <Badge
              key={subnet.uuid}
              variant="secondary"
              outline
              tooltip={subnet.description || undefined}
            >
              {subnet.inet}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
};
