import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { Tooltip } from '@waldur/core/Tooltip';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';
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

export const ResourceNameField: FunctionComponent<ResourceNameFieldProps> = ({
  row,
  customer,
}) => {
  const label = row.name || row.offering_name;
  let LinkComponent;
  if (row.resource_type && row.resource_uuid) {
    // eslint-disable-next-line no-console
    console.log('executing this one');
    LinkComponent = (
      <ResourceDetailsLink item={row}>{label}</ResourceDetailsLink>
    );
  } else if (row.offering_type === SUPPORT_OFFERING_TYPE) {
    LinkComponent = (
      <Link
        state="project.support-details"
        params={{
          resource_uuid: row.uuid,
          uuid: row.project_uuid,
        }}
        label={label}
      />
    );
  } else {
    LinkComponent = <PublicResourceLink row={row} customer={customer} />;
  }
  return TooltipWrapper(LinkComponent, row.backend_id);
};
