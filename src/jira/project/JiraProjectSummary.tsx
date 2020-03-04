import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';

const formatProjectType = resource =>
  resource.template_name ? (
    <Tooltip label={resource.template_description} id="projectType">
      <i className="fa fa-question-circle" /> {resource.template_name}
    </Tooltip>
  ) : (
    'N/A'
  );

const PureJiraProjectSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props} />
      <Field label={translate('Name')} value={resource.name} />
      <Field
        label={translate('Project type')}
        value={formatProjectType(resource)}
      />
    </span>
  );
};

export const JiraProjectSummary = withTranslation(PureJiraProjectSummary);
