import React, { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

import { ResourceReference } from './types';

interface ResourceDetailsLinkProps {
  item: ResourceReference;
  children?: React.ReactNode;
}

export const ResourceDetailsLink: FunctionComponent<ResourceDetailsLinkProps> = (
  props,
) => (
  <Link
    state="resource-details" //
    params={{
      resource_type: props.item.resource_type,
      uuid: props.item.resource_uuid,
    }}
    label={props.children}
  />
);
