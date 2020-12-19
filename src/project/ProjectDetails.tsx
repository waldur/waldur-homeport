import { FunctionComponent } from 'react';

import { TranslateProps } from '@waldur/i18n';

interface ProjectDetailsProps extends TranslateProps {
  name: string;
  description: string;
}

export const ProjectDetails: FunctionComponent<ProjectDetailsProps> = (
  props,
) => (
  <dl className="dl-horizontal">
    <dt>{props.translate('Name')}:</dt>
    <dd>{props.name}</dd>

    <dt className="m-t-sm">{props.translate('Description')}:</dt>
    <dd className="m-t-sm">{props.description || 'N/A'}</dd>
  </dl>
);
