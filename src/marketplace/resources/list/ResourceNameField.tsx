import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

import { ResourceDetailsLink } from '../ResourceDetailsLink';
import { Resource } from '../types';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
}

const TooltipWrapper = (component, tooltip) => (
  <>
    {component}
    {tooltip && (
      <>
        {' '}
        <Tooltip id="backend-id" label={tooltip}>
          <i className="fa fa-question-circle" />
        </Tooltip>
      </>
    )}
  </>
);

export const ResourceNameField = ({ row }: ResourceNameFieldProps) => {
  const label = row.name || row.offering_name;
  let LinkComponent;
  if (row.resource_type && row.resource_uuid) {
    LinkComponent = (
      <ResourceDetailsLink item={row}>{label}</ResourceDetailsLink>
    );
  } else {
    LinkComponent = <PublicResourceLink row={row} />;
  }
  return TooltipWrapper(LinkComponent, row.backend_id);
};
