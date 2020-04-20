import * as React from 'react';

import { IssuesList } from '@waldur/issues/list/IssuesList';

export const ResourceIssuesList = props => (
  <IssuesList
    hiddenColumns={['customer', 'resource_type']}
    filter={{ resource: props.resource.url }}
    scope={{ resource: props.resource }}
  />
);
