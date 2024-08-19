import { ArrowSquareOut, CaretDown } from '@phosphor-icons/react';

import { Link } from '@waldur/core/Link';

export const ResourceHeader = ({ toggled, resource }) => (
  <div className="fs-6">
    <span className={toggled ? 'active' : ''}>
      <CaretDown size={20} weight="bold" className="rotate-180" />
    </span>{' '}
    {resource.name} {resource.offering_name && `/ ${resource.offering_name} `}
    {resource.uuid ? (
      <Link
        state="marketplace-resource-details"
        params={{ resource_uuid: resource.uuid }}
        className="hidden-print"
      >
        <ArrowSquareOut />
      </Link>
    ) : null}
  </div>
);
