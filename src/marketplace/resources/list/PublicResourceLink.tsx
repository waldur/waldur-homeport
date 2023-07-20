import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { BackendIdTip } from '@waldur/core/Tooltip';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { Customer } from '@waldur/workspace/types';

import { Resource } from '../types';

import { EndDateTooltip } from './EndDateTooltip';

export const usePublicResourceState = (resource: any, customer: Customer) => {
  const { state: currentState, params } = useCurrentStateAndParams();
  let uuid = customer ? customer.uuid : resource.customer_uuid;
  let state;
  if (isDescendantOf('project', currentState)) {
    state = 'marketplace-project-resource-details';
    uuid = resource.project_uuid || params?.uuid;
  } else if (isDescendantOf('marketplace-provider', currentState)) {
    state = 'marketplace-provider-resource-details';
  } else if (isDescendantOf('organization', currentState)) {
    state = 'marketplace-public-resource-details';
  } else if (isDescendantOf('admin', currentState)) {
    state = 'marketplace-admin-resource-details';
  } else if (isDescendantOf('profile', currentState)) {
    state = 'marketplace-profile-resource-details';
  }
  return {
    state,
    params: {
      uuid,
      resource_uuid: resource.uuid,
    },
  };
};

interface PublicResourceLinkProps {
  row: Resource;
  customer?: Customer;
}

export const PublicResourceLink: FunctionComponent<PublicResourceLinkProps> = ({
  row,
  customer,
}) => {
  const stateAndParams = usePublicResourceState(row, customer);
  const label = row.name || row.offering_name;
  if (!stateAndParams.state) {
    return (
      <>
        {label} <BackendIdTip backendId={row.backend_id} />
        <EndDateTooltip end_date={row.end_date} />
      </>
    );
  }
  return (
    <>
      <Link
        state={stateAndParams.state}
        params={stateAndParams.params}
        label={label}
      />
      <BackendIdTip backendId={row.backend_id} />
      <EndDateTooltip end_date={row.end_date} />
    </>
  );
};
