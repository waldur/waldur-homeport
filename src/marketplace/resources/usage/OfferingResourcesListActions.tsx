import { FunctionComponent } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useBoolean } from 'react-use';

import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { isSupportOnly } from '@waldur/workspace/selectors';

import { ResourceCreateUsageButton } from './ResourceCreateUsageButton';
import { ResourceShowUsageButton } from './ResourceShowUsageButton';

interface Props {
  row: Pick<
    Resource,
    | 'state'
    | 'plan'
    | 'is_usage_based'
    | 'uuid'
    | 'offering_uuid'
    | 'name'
    | 'customer_name'
    | 'project_name'
    | 'backend_id'
  >;
}

export const OfferingResourcesListActions: FunctionComponent<Props> = ({
  row,
}) => {
  const [open, onToggle] = useBoolean(false);
  const is_support_only = useSelector(isSupportOnly);
  if (!row.is_usage_based || !row.plan || row.state === 'Creating') {
    return <>{'N/A'}</>;
  }
  return (
    <DropdownButton
      title={translate('Actions')}
      id="offering-resources-actions-dropdown-btn"
      className="dropdown-btn"
      onToggle={onToggle}
      open={open}
    >
      <ResourceShowUsageButton
        resource={row}
        offeringUuid={row.offering_uuid}
        resourceUuid={row.uuid}
      />
      {!is_support_only && (
        <ResourceCreateUsageButton
          resource={row}
          usageReportContext={{
            offering_uuid: row.offering_uuid,
            resource_uuid: row.uuid,
            resource_name: row.name,
            customer_name: row.customer_name,
            project_name: row.project_name,
            backend_id: row.backend_id,
          }}
        />
      )}
    </DropdownButton>
  );
};
