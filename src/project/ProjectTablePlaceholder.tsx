import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table-react/ImageTablePlaceholder';

// tslint:disable-next-line: no-var-requires
const Illustration = require('@waldur/images/table-placeholders/undraw_organizing_projects.svg');

export const ProjectTablePlaceholder = () => (
  <ImageTablePlaceholder
    illustration={Illustration}
    title={translate(`Your organization does not have any projects yet.`)}
    // tslint:disable-next-line: max-line-length
    description={translate(`Project aggregates and isolates teams and resources.`)}
    action={
      <Link state="organization.createProject" className="btn btn-success btn-md">
        {translate('Create your first project')}
      </Link>
    }
  />
);
