import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { getById } from '@waldur/core/api';
import { formatRelative, formatDateTime } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { IssueAttachmentsContainer } from './attachments/IssueAttachmentsContainer';
import { IssueCommentsContainer } from './comments/IssueCommentsContainer';

const linkify = s =>
  s.replace(
    /\[(.+?)\|(.+)\]/g,
    (_, name, href) => `<a href="${href}">${name}</a>`,
  );

const loadIssue = id => getById<any>('/support-issues/', id);

export const IssueDetails = () => {
  const currentUser = useSelector(getUser);

  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();

  if (!uuid) {
    router.stateService.go('errorPage.notFound');
  }

  const { loading, error, value: issue } = useAsync(() => loadIssue(uuid));

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load data.')}</>;
  }

  const staffOrSupport = currentUser.is_staff || currentUser.is_support;
  return (
    <>
      <div className="ibox">
        <div className="ibox-content">
          <div className="row m-b-md">
            <div className="col-lg-12">
              <h2>
                {issue.key ? `${issue.key}: ${issue.summary}` : issue.summary}
              </h2>
            </div>
          </div>
          <div className="row m-b-md">
            <dl className="dl-horizontal resource-details-table col-sm-12">
              <div className="m-b-xs">
                <dt>{translate('Caller')}:</dt>
                <dd>{issue.caller_full_name}</dd>
              </div>

              {issue.reporter_name && staffOrSupport && (
                <div className="m-b-xs">
                  <dt>{translate('Reporter')}:</dt>
                  <dd>{issue.reporter_name}</dd>
                </div>
              )}

              {staffOrSupport && (
                <div className="m-b-xs">
                  <dt>{translate('Assigned to')}:</dt>
                  <dd>{issue.assignee_name || 'N/A'}</dd>
                </div>
              )}

              {issue.customer_name && (
                <div className="m-b-xs">
                  <dt>{translate('Organization')}:</dt>
                  <dd>{issue.customer_name}</dd>
                </div>
              )}

              <div className="m-b-xs">
                <dt>{translate('Request type')}:</dt>
                <dd>{issue.type}</dd>
              </div>

              {issue.project_name && (
                <div className="m-b-xs">
                  <dt>{translate('Project')}:</dt>
                  <dd>{issue.project_name}</dd>
                </div>
              )}

              {issue.resource_type && (
                <div className="m-b-xs">
                  <dt>{translate('Service type')}:</dt>
                  <dd>{issue.resource_type}</dd>
                </div>
              )}

              {issue.resource_name && (
                <div className="m-b-xs">
                  <dt>{translate('Affected resource')}:</dt>
                  <dd>{issue.resource_name}</dd>
                </div>
              )}

              <div className="m-b-xs">
                <dt>{translate('Status')}:</dt>
                <dd>{issue.status || 'N/A'}</dd>
              </div>

              {issue.resolution && (
                <div className="m-b-xs">
                  <dt>{translate('Resolution')}:</dt>
                  <dd>{issue.resolution}</dd>
                </div>
              )}

              {issue.priority && (
                <div className="m-b-xs">
                  <dt>{translate('Priority')}:</dt>
                  <dd>{issue.priority}</dd>
                </div>
              )}

              {issue.link && staffOrSupport && (
                <div className="m-b-xs">
                  <dt>{translate('Link')}:</dt>
                  <dd>
                    <a
                      href={issue.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-external-link" />{' '}
                      {translate('Open in Service Desk')}
                    </a>
                  </dd>
                </div>
              )}

              <div className="m-b-xs">
                <dt>{translate('Created')}:</dt>
                <dd>
                  {formatRelative(issue.created)} ago,{' '}
                  {formatDateTime(issue.created)}
                </dd>
              </div>
            </dl>

            <div className="col-sm-12">
              <h3>{translate('Description')}</h3>
              <div className="html-description">
                <FormattedHtml html={linkify(issue.description)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <IssueAttachmentsContainer issue={issue} />

      <IssueCommentsContainer issue={issue} />
    </>
  );
};
