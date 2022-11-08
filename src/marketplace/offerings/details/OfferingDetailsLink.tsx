import React from 'react';

import { Link } from '@waldur/core/Link';

interface OfferingDetailsLinkProps {
  offering_uuid: string;
}

export const OfferingDetailsLink: React.FC<OfferingDetailsLinkProps> = (
  props,
) => (
  <Link
    state="marketplace-provider-offering-details"
    params={{ offering_uuid: props.offering_uuid }}
  >
    {props.children}
  </Link>
);
