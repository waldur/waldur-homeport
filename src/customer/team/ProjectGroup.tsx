import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { NestedProjectPermission } from 'waldur-js-client';

import { translate } from '@/i18n';

export const ProjectGroup: FunctionComponent<{
  project: NestedProjectPermission;
}> = ({ project }) => (
  <Form.Group>
    <p>
      <strong>{translate('Project')}</strong>: {project.name}
    </p>
  </Form.Group>
);
