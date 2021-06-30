import { FC } from 'react';
import { PanelBody } from 'react-bootstrap';

import { IssuesList } from '@waldur/issues/list/IssuesList';

import { Resource } from './types';

export const ResourceIssuesTab: FC<{ resource: Resource }> = ({ resource }) => (
  <PanelBody>
    <IssuesList
      filter={{
        resource:
          resource.offering_type === 'Support.OfferingTemplate'
            ? resource.url
            : resource.scope,
      }}
    />
  </PanelBody>
);
