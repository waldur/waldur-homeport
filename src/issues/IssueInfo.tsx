import { EyeIcon } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Issue } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatRelative, formatDateTime } from '@waldur/core/dateUtils';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Field } from '@waldur/resource/summary';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

const IssueInfoDialog = ({ issue }: { issue: Issue }) => {
  const staffOrSupport = useSelector(isStaffOrSupport);
  return (
    <ModalDialog
      title={translate('Info')}
      closeButton
      bodyClassName="d-flex flex-column gap-1"
    >
      {staffOrSupport && (
        <Field
          label={translate('Assigned to')}
          value={issue.assignee_name || 'N/A'}
          labelClass="mw-200px"
        />
      )}

      {issue.priority && (
        <Field
          label={translate('Priority')}
          value={
            <Badge
              variant={{ Medium: 'warning', High: 'danger' }[issue.priority]}
              outline
              pill
              size="sm"
            >
              {issue.priority}
            </Badge>
          }
          labelClass="mw-200px"
        />
      )}

      {issue.reporter_name && staffOrSupport && (
        <Field
          label={translate('Reporter')}
          value={issue.reporter_name}
          labelClass="mw-200px"
          hasCopy
        />
      )}

      <Field
        label={translate('Caller')}
        value={issue.caller_full_name}
        labelClass="mw-200px"
      />

      <Field
        label={translate('Request type')}
        value={issue.type}
        labelClass="mw-200px"
      />

      {issue.customer_name && (
        <Field
          label={translate('Organization')}
          value={issue.customer_name}
          labelClass="mw-200px"
        />
      )}

      {issue.project_name && (
        <Field
          label={translate('Project')}
          value={issue.project_name}
          labelClass="mw-200px"
        />
      )}

      {issue.resource_type && (
        <Field
          label={translate('Service type')}
          value={issue.resource_type}
          labelClass="mw-200px"
        />
      )}

      {issue.resource_name && (
        <Field
          label={translate('Affected resource')}
          value={issue.resource_name}
          labelClass="mw-200px"
        />
      )}

      {issue.resolution && (
        <Field
          label={translate('Resolution')}
          value={issue.resolution}
          labelClass="mw-200px"
        />
      )}

      {issue.link && staffOrSupport && (
        <Field
          label={translate('Link')}
          value={
            <ExternalLink
              label={translate('Open in Service Desk')}
              url={issue.link}
              iconless
              className="text-anchor"
            />
          }
          labelClass="mw-200px"
        />
      )}

      <Field
        label={translate('Created')}
        value={translate('{relative} ago, {date}', {
          relative: formatRelative(issue.created),
          date: formatDateTime(issue.created),
        })}
        labelClass="mw-200px"
      />
    </ModalDialog>
  );
};

export const IssueInfoButton = ({ issue }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(IssueInfoDialog, {
        issue,
      }),
    );
  return (
    <Button variant="secondary" onClick={callback}>
      <span className="svg-icon svg-icon-2">
        <EyeIcon />
      </span>
      {translate('Show details')}
    </Button>
  );
};
