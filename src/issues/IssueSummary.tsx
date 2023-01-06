import { useSelector } from 'react-redux';

import { formatRelative, formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

export const IssueSummary = ({ issue }) => {
  const staffOrSupport = useSelector(isStaffOrSupport);
  return (
    <>
      <Field label={translate('Caller')} value={issue.caller_full_name} />

      {issue.reporter_name && staffOrSupport && (
        <Field label={translate('Reporter')} value={issue.reporter_name} />
      )}

      {staffOrSupport && (
        <Field
          label={translate('Assigned to')}
          value={issue.assignee_name || 'N/A'}
        />
      )}

      {issue.customer_name && (
        <Field label={translate('Organization')} value={issue.customer_name} />
      )}

      <Field label={translate('Request type')} value={issue.type} />

      {issue.project_name && (
        <Field label={translate('Project')} value={issue.project_name} />
      )}

      {issue.resource_type && (
        <Field label={translate('Service type')} value={issue.resource_type} />
      )}

      {issue.resource_name && (
        <Field
          label={translate('Affected resource')}
          value={issue.resource_name}
        />
      )}

      <Field label={translate('Status')} value={issue.status || 'N/A'} />

      {issue.resolution && (
        <Field label={translate('Resolution')} value={issue.resolution} />
      )}

      {issue.priority && (
        <Field label={translate('Priority')} value={issue.priority} />
      )}

      {issue.link && staffOrSupport && (
        <Field
          label={translate('Link')}
          value={
            <a href={issue.link} target="_blank" rel="noopener noreferrer">
              <i className="fa fa-external-link" />{' '}
              {translate('Open in Service Desk')}
            </a>
          }
        />
      )}

      <Field
        label={translate('Created')}
        value={translate('{relative} ago, {date}', {
          relative: formatRelative(issue.created),
          date: formatDateTime(issue.created),
        })}
      />
    </>
  );
};
