import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { IssuesList } from '@waldur/issues/list/IssuesList';

import { Resource } from '../types';

export const ResourceIssuesTab: FC<{ resource: Resource }> = ({ resource }) => (
  <Card.Body>
    <IssuesList
      filter={{
        resource:
          resource.offering_type === 'Support.OfferingTemplate'
            ? resource.url
            : resource.scope,
      }}
    />
  </Card.Body>
);
