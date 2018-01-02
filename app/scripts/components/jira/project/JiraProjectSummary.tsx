import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';

const formatProjectType = resource => (
  <Tooltip label={resource.template_description} id="projectType">
    <i className="fa fa-question-circle"></i>
    {resource.template_name}
  </Tooltip>
);

const PureJiraProjectSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Project type')}
        value={formatProjectType(resource)}
      />
    </span>
  );
};

export const JiraProjectSummary = withTranslation(PureJiraProjectSummary);
