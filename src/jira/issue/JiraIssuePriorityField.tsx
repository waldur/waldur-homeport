import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export const JiraIssuePriorityField = props => (
  <Tooltip label={props.priority_description} id="issueType">
    <img
      src={props.priority_icon_url}
      style={{ width: 16 }}
      className="m-r-xs"
    />
    {props.priority_name}
  </Tooltip>
);
