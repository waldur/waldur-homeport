import { FunctionComponent } from 'react';

import { useSupport } from '@waldur/issues/hooks';
import { IssuesList } from '@waldur/issues/list/IssuesList';

export const ResourceIssuesList: FunctionComponent<any> = (props) => {
  useSupport();

  return (
    <IssuesList
      hiddenColumns={['customer', 'resource_type']}
      filter={{ resource: props.resource.url }}
      scope={{ resource: props.resource }}
    />
  );
};
