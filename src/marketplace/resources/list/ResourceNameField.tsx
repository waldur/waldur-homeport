import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { Customer } from '@waldur/workspace/types';

import { ResourceDetailsLink } from '../ResourceDetailsLink';
import { Resource } from '../types';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
  customer?: Customer;
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

export const ResourceNameField = ({
  row,
  customer,
}: ResourceNameFieldProps) => {
  const label = row.name || row.offering_name;
  let LinkComponent;
  if (row.resource_type && row.resource_uuid) {
    LinkComponent = (
      <ResourceDetailsLink item={row}>{label}</ResourceDetailsLink>
    );
  } else {
    LinkComponent = <PublicResourceLink row={row} customer={customer} />;
  }
  return TooltipWrapper(LinkComponent, row.backend_id);
};
