import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

import { ProjectCreateButton } from './ProjectCreateButton';

const Illustration = require('@waldur/images/table-placeholders/undraw_organizing_projects.svg');

export const ProjectTablePlaceholder: FunctionComponent = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`Your organization does not have any projects yet.`)}
    description={translate(
      `Project aggregates and isolates teams and resources.`,
    )}
    action={
      <ProjectCreateButton
        title={translate('Create your first project')}
        variant="success"
      />
    }
  />
);
