import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { BackendIdTooltip } from '@waldur/core/Tooltip';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';
import { Customer } from '@waldur/workspace/types';

import { ResourceDetailsLink } from '../ResourceDetailsLink';
import { Resource } from '../types';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
  customer?: Customer;
}

export const ResourceNameField: FunctionComponent<ResourceNameFieldProps> = ({
  row,
  customer,
}) => {
  const label = row.name || row.offering_name;
  let LinkComponent;
  if (row.resource_type && row.resource_uuid) {
    LinkComponent = (
      <ResourceDetailsLink item={row}>{label}</ResourceDetailsLink>
    );
  } else if (row.offering_type === SUPPORT_OFFERING_TYPE) {
    LinkComponent = (
      <>
        <Link
          state="project.support-details"
          params={{
            resource_uuid: row.uuid,
            uuid: row.project_uuid,
          }}
          label={label}
        />
        <BackendIdTooltip backendId={row.backend_id} />
      </>
    );
  } else {
    LinkComponent = <PublicResourceLink row={row} customer={customer} />;
  }
  return LinkComponent;
};
