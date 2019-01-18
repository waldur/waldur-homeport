import * as React from 'react';

import { Link } from '@waldur/core/Link';

import { ResourceReference } from './types';

interface ResourceDetailsLinkProps {
  item: ResourceReference;
  children?: React.ReactNode;
}

const supportOfferingTemplate = 'Support.Offering';

export const ResourceDetailsLink = (props: ResourceDetailsLinkProps) => {
  if (props.item.resource_type === supportOfferingTemplate) {
    return (
      <Link
        state="offeringDetails"
        params={{
          uuid: props.item.resource_uuid,
        }}
        label={props.children}/>
    );
  } else {
    return (
      <Link
        state="resources.details"
        params={{
          resource_type: props.item.resource_type,
          uuid: props.item.resource_uuid,
        }}
        label={props.children}
      />
    );
  }
};
