import * as React from 'react';

import { Link } from '@waldur/core/Link';

interface ResourceLinkProps {
  type: string;
  uuid: string;
  label: React.ReactNode;
}

export const ResourceLink = (props: ResourceLinkProps) => (
  <Link
    state="resources.details"
    params={{
      resource_type: props.type,
      uuid: props.uuid,
    }}
    label={props.label}
  />
);
