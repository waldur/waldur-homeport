import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export const JiraIssueStatusField = props => (
  <Tooltip label={props.type_description} id="issueStatus">
    <img src={props.type_icon_url} style={{width: 16}} className="m-r-xs"/>
    {props.status}
  </Tooltip>
);
