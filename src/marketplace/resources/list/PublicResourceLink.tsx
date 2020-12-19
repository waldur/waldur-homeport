import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { Tooltip } from '@waldur/core/Tooltip';
import { Customer } from '@waldur/workspace/types';

import { Resource } from '../types';

interface PublicResourceLinkProps {
  row: Resource;
  customer?: Customer;
}

const BackendIdTooltip = ({ backendId }) =>
  backendId && (
    <>
      {' '}
      <Tooltip id="backend-id" label={backendId}>
        <i className="fa fa-question-circle" />
      </Tooltip>
    </>
  );

export const PublicResourceLink: FunctionComponent<PublicResourceLinkProps> = ({
  row,
  customer,
}) => {
  const label = row.name || row.offering_name;
  return (
    <>
      <Link
        state={
          customer
            ? 'marketplace-service-provider-public-resource-details'
            : 'marketplace-public-resource-details'
        }
        params={{
          uuid: customer ? customer.uuid : row.customer_uuid,
          resource_uuid: row.uuid,
        }}
        label={label}
      />
      <BackendIdTooltip backendId={row.backend_id} />
    </>
  );
};
