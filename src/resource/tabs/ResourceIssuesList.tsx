import * as React from 'react';

import { IssuesList } from '@waldur/issues/list/IssuesList';
import { connectAngularComponent } from '@waldur/store/connect';

const ResourceIssuesList = props => (
  <IssuesList
    hiddenColumns={['customer', 'resource_type']}
    filter={{resource: props.resource.url}}
    scope={{resource: props.resource}}
  />
);

export default connectAngularComponent(ResourceIssuesList, ['resource']);
