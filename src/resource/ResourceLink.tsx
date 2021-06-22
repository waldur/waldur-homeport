import React, { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

interface ResourceLinkProps {
  type: string;
  uuid: string;
  project: string;
  label: React.ReactNode;
}

export const ResourceLink: FunctionComponent<ResourceLinkProps> = (props) => (
  <Link
    state="resource-details"
    params={{
      resource_type: props.type,
      resource_uuid: props.uuid,
      uuid: props.project,
    }}
    label={props.label}
  />
);
