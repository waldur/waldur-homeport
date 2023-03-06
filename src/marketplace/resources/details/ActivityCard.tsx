import { UISref } from '@uirouter/react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ResourceTimeline } from './ResourceTimeline';

export const ActivityCard = ({ state, resource }) => (
  <Card className="mb-7">
    <Card.Header>
      <Card.Title>
        <h3 className="mb-5">{translate('Activity')}</h3>
      </Card.Title>
      <div className="card-toolbar">
        <UISref to={state.name} params={{ tab: 'events' }}>
          <a className="btn btn-link">{translate('See all')}</a>
        </UISref>
      </div>
    </Card.Header>
    <Card.Body>
      <ResourceTimeline resource={resource} />
    </Card.Body>
  </Card>
);
