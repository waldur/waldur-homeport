import React, { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { BackendIdTip } from '@waldur/core/Tooltip';

import { EndDateTooltip } from '../list/EndDateTooltip';

interface ResourceDetailsLinkProps {
  item: { resource_uuid; backend_id; end_date };
  children?: React.ReactNode;
}

export const ResourceDetailsLink: FunctionComponent<
  ResourceDetailsLinkProps
> = (props) => (
  <>
    <Link
      state="resource-details"
      params={{
        resource_uuid: props.item.resource_uuid,
      }}
      label={props.children}
    />
    <BackendIdTip backendId={props.item.backend_id} />
    <EndDateTooltip end_date={props.item.end_date} />
  </>
);
