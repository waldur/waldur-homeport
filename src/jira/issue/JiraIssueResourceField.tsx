import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { getResourceIcon } from '@waldur/resource/utils';

export const JiraIssueResourceField = props => (
  <Tooltip label={props.scope_type} id="issueScope">
    <img src={getResourceIcon(props.scope_type)} style={{width: 16}} className="m-r-xs"/>
    {props.scope_name}
  </Tooltip>
);
