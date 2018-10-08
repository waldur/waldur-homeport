import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';

interface ProjectDetailsProps extends TranslateProps {
  name: string;
  description: string;
}

export const ProjectDetails = (props: ProjectDetailsProps) => (
  <dl className="dl-horizontal">
    <dt>{props.translate('Name')}:</dt>
    <dd>{props.name}</dd>

    <dt className="m-t-sm">{props.translate('Description')}:</dt>
    <dd className="m-t-sm">{props.description || 'N/A'}</dd>
  </dl>
);
