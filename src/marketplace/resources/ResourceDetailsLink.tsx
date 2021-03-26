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
    state="resource-details"
    params={{
      resource_type: props.item.resource_type,
      resource_uuid: props.item.resource_uuid,
      uuid: 'fc2218677ea846868d22b3c272d76da7',
      category_uuid: '6dfcdbe3c18241dc87526ef411bf6064',
    }}
    label={props.children}
  />
);
