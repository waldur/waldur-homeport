import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';

import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceCreateUsageButton } from '@waldur/marketplace/resources/usage/ResourceCreateUsageButton';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

interface OfferingResourcesActionsProps {
  row: Resource;
}

export const OfferingResourcesActions: FunctionComponent<OfferingResourcesActionsProps> = ({
  row,
}) => {
  const [open, onToggle] = useBoolean(false);
  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      actions={[
        () => (
          <ResourceShowUsageButton
            resource={row}
            offeringUuid={row.offering_uuid}
            resourceUuid={row.uuid}
          />
        ),
        () => (
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
        ),
        SetBackendIdAction,
      ]}
      resource={row}
    />
  );
};
