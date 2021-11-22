import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { BackendIdTooltip } from '@waldur/core/Tooltip';
import { getWorkspace } from '@waldur/workspace/selectors';
import {
  Customer,
  PROJECT_WORKSPACE,
  WorkspaceType,
} from '@waldur/workspace/types';

import { Resource } from '../types';

import { EndDateTooltip } from './EndDateTooltip';

interface PublicResourceLinkProps {
  row: Resource;
  customer?: Customer;
}

const getStateAndUuid = (
  resource: Resource,
  workspace: WorkspaceType,
  customer: Customer,
): { state: string; uuid: string } => {
  let state,
    uuid = '';
  if (workspace === PROJECT_WORKSPACE) {
    state = 'marketplace-project-resource-details';
    uuid = resource.project_uuid;
    return { state, uuid };
  }
  state = customer
    ? 'marketplace-service-provider-public-resource-details'
    : 'marketplace-public-resource-details';
  uuid = customer ? customer.uuid : resource.customer_uuid;
  return { state, uuid };
};

export const PublicResourceLink: FunctionComponent<PublicResourceLinkProps> = ({
  row,
  customer,
}) => {
  const workspace = useSelector(getWorkspace);
  const label = row.name || row.offering_name;
  return (
    <>
      <Link
        state={getStateAndUuid(row, workspace, customer).state}
        params={{
          uuid: getStateAndUuid(row, workspace, customer).uuid,
          resource_uuid: row.uuid,
        }}
        label={label}
      />
      <BackendIdTooltip backendId={row.backend_id} />
      <EndDateTooltip end_date={row.end_date} />
    </>
  );
};
