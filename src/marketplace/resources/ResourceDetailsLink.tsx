import React, { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { BackendIdTooltip } from '@waldur/core/Tooltip';

import { EndDateTooltip } from './list/EndDateTooltip';
import { ResourceReference } from './types';

interface ResourceDetailsLinkProps {
  item: ResourceReference;
  children?: React.ReactNode;
}

export const ResourceDetailsLink: FunctionComponent<ResourceDetailsLinkProps> =
  (props) => (
    <>
      <Link
        state="resource-details"
        params={{
          resource_type: props.item.resource_type,
          resource_uuid: props.item.resource_uuid,
          uuid: props.item.project_uuid,
        }}
        label={props.children}
      />
      <BackendIdTooltip backendId={props.item.backend_id} />
      <EndDateTooltip end_date={props.item.end_date} />
    </>
  );
