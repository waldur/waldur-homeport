import { Row } from 'react-bootstrap';

import { Panel } from '@waldur/core/Panel';

import { ProjectUpdateRequestListFilter } from './ProjectUpdateRequestListFilter';
import { ProjectUpdateRequestsList } from './ProjectUpdateRequestsList';

export const ProjectUpdateRequestListContainer = () => (
  <Panel>
    <Row>
      <ProjectUpdateRequestListFilter />
    </Row>
    <ProjectUpdateRequestsList />
  </Panel>
);
