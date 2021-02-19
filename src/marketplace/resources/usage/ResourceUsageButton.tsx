import { FunctionComponent } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
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

export const ResourceUsageButton: FunctionComponent<Props> = ({ row }) => {
  const [open, onToggle] = useBoolean(false);
  const is_support_only = useSelector(isSupportOnly);
  if (!row.is_usage_based || !row.plan || row.state === 'Creating') {
    return <>{'N/A'}</>;
  }
  const disabled = !['OK', 'Updating', 'Terminating'].includes(row.state);
  return (
    <DropdownButton
      title={translate('Actions')}
      id="resources-actions"
      className="dropdown-btn"
      onToggle={onToggle}
      open={open}
      // disabled={props.disabled}
    >
      <MenuItem eventKey="1">{translate('Loading actions')}</MenuItem>
      <MenuItem eventKey="1">
        <ResourceShowUsageButton
          offeringUuid={row.offering_uuid}
          resourceUuid={row.uuid}
        />
        {!is_support_only && (
          <MenuItem eventKey="1">
            <ResourceCreateUsageButton
              offering_uuid={row.offering_uuid}
              resource_uuid={row.uuid}
              resource_name={row.name}
              customer_name={row.customer_name}
              project_name={row.project_name}
              backend_id={row.backend_id}
              disabled={disabled}
            />
          </MenuItem>
        )}
        <p>set backend id</p>
      </MenuItem>
    </DropdownButton>
  );
};
