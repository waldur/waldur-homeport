import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { BackendIdTip } from '@waldur/core/Tooltip';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { Customer } from '@waldur/workspace/types';

import { Resource } from '../types';

import { EndDateTooltip } from './EndDateTooltip';

interface PublicResourceLinkProps {
  row: Resource;
  customer?: Customer;
}

export const PublicResourceLink: FunctionComponent<PublicResourceLinkProps> = ({
  row,
  customer,
}) => {
  const { state: currentState } = useCurrentStateAndParams();
  let uuid = customer ? customer.uuid : row.customer_uuid;
  let state = 'marketplace-public-resource-details';
  if (isDescendantOf('project', currentState)) {
    state = 'marketplace-project-resource-details';
    uuid = row.project_uuid;
  } else if (isDescendantOf('marketplace-provider', currentState)) {
    state = 'marketplace-provider-resource-details';
  } else if (isDescendantOf('organization', currentState)) {
    state = 'marketplace-public-resource-details';
  } else if (isDescendantOf('admin', currentState)) {
    state = 'marketplace-admin-resource-details';
  }
  const label = row.name || row.offering_name;
  return (
    <>
      <Link
        state={state}
        params={{
          uuid,
          resource_uuid: row.uuid,
        }}
        label={label}
      />
      <BackendIdTip backendId={row.backend_id} />
      <EndDateTooltip end_date={row.end_date} />
    </>
  );
};
