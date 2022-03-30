import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { BackendIdTip } from '@waldur/core/Tooltip';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';
import { Customer } from '@waldur/workspace/types';

import { ResourceDetailsLink } from '../ResourceDetailsLink';
import { Resource } from '../types';

import { EndDateTooltip } from './EndDateTooltip';
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
  if (row.resource_type && row.resource_uuid) {
    return <ResourceDetailsLink item={row}>{label}</ResourceDetailsLink>;
  } else if (row.offering_type === SUPPORT_OFFERING_TYPE) {
    return (
      <>
        <Link
          state="project.support-details"
          params={{
            resource_uuid: row.uuid,
            uuid: row.project_uuid,
          }}
          label={label}
        />
        <BackendIdTip backendId={row.backend_id} />
        <EndDateTooltip end_date={row.end_date} />
      </>
    );
  } else {
    return <PublicResourceLink row={row} customer={customer} />;
  }
};
