import { FunctionComponent } from 'react';
import { NestedProjectPermission } from 'waldur-js-client';

import { FormField } from 'waldur-ui';

import { translate } from '@/i18n';

export const ProjectGroup: FunctionComponent<{
  project: NestedProjectPermission;
}> = ({ project }) => (
  <FormField>
    <p>
      <strong>{translate('Project')}</strong>: {project.name}
    </p>
  </FormField>
);
