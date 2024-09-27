import React, { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

interface ResourceLinkProps {
  uuid: string;
  label: React.ReactNode;
}

export const ResourceLink: FunctionComponent<ResourceLinkProps> = (props) => (
  <Link
    state="marketplace-resource-details"
    params={{
      resource_uuid: props.uuid,
    }}
    label={props.label}
  />
);
