import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { NestedProjectPermission } from './types';

export const ProjectGroup: FunctionComponent<{
  project: NestedProjectPermission;
}> = ({ project }) => (
  <Form.Group>
    <p>
      <strong>{translate('Project')}</strong>: {project.name}
    </p>
  </Form.Group>
);
