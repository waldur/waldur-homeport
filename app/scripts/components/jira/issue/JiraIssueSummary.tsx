import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';

import { JiraIssuePriorityField } from './JiraIssuePriorityField';
import { JiraIssueResourceField } from './JiraIssueResourceField';
import { JiraIssueStatusField } from './JiraIssueStatusField';

const formatProject = resource => (
  <ResourceLink
    type="JIRA.Project"
    uuid={resource.jira_project_uuid}
    label={resource.jira_project_name}
  />
);

const formatParent = resource =>
  resource.parent ? (
    <ResourceLink
      type="JIRA.Issue"
      uuid={resource.parent_uuid}
      label={resource.parent_summary}
    />
  ) : null;

const PureJiraIssueSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Key')}
        value={resource.key}
      />
      <Field
        label={translate('Status')}
        value={<JiraIssueStatusField {...resource}/>}
      />
      <Field
        label={translate('Priority')}
        value={<JiraIssuePriorityField {...resource}/>}
      />
      <Field
        label={translate('Title')}
        value={resource.summary}
      />
      <Field
        label={translate('Description')}
        value={resource.description}
      />
      <Field
        label={translate('Project')}
        value={formatProject(resource)}
      />
      <Field
        label={translate('Parent request')}
        value={formatParent(resource)}
      />
      <Field
        label={translate('Related resource')}
        value={resource.scope && <JiraIssueResourceField {...resource}/>}
      />
    </span>
  );
};

export const JiraIssueSummary = withTranslation(PureJiraIssueSummary);
