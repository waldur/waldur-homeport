import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { supportIssuesRetrieve } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { formatDateTime, formatRelative } from '@waldur/core/dateUtils';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { linkify } from '@waldur/issues/utils';
import { useBreadcrumbs } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { Field } from '@waldur/resource/summary';
import { injectReducer, injectSaga } from '@waldur/store/store';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { IssueAttachmentsContainer } from './attachments/IssueAttachmentsContainer';
import { IssueCommentsContainer } from './comments/IssueCommentsContainer';
import { IssueInfoButton } from './IssueInfo';
import { IssueStatus } from './IssueStatus';
import { useIssueBreadcrumbItems } from './utils';

const loadDependencies = async (issueId: string) => {
  const [issue, issueAttachmentsSaga, issueCommentsSaga, reducer] =
    await Promise.all([
      supportIssuesRetrieve({ path: { uuid: issueId } }),
      import('@waldur/issues/attachments/effects').then(
        (module) => module.default,
      ),
      import('@waldur/issues/comments/effects').then(
        (module) => module.default,
      ),
      import('@waldur/issues/reducers').then((module) => module.reducer),
    ]);
  injectSaga('issueAttachmentsSaga', issueAttachmentsSaga);
  injectSaga('issueCommentsSaga', issueCommentsSaga);
  injectReducer('issues', reducer);
  return issue.data;
};

export const IssueDetails: FunctionComponent = () => {
  useTitle(translate('Request detail'));

  const {
    params: { issue_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();

  const staffOrSupport = useSelector(isStaffOrSupport);

  if (!issue_uuid) {
    router.stateService.go('errorPage.notFound');
  }

  const {
    loading,
    error,
    value: issue,
  } = useAsync(() => loadDependencies(issue_uuid));

  const breadcrumbItems = useIssueBreadcrumbItems(issue);

  useBreadcrumbs(breadcrumbItems);

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load data.')}</>;
  }

  return (
    <>
      <PublicDashboardHero
        containerClassName="mb-5"
        cardBordered
        hideQuickSection
        title={
          <div className="d-flex flex-wrap align-items-center gap-3">
            <h3 className="mb-0">
              {issue.key ? `${issue.key}: ${issue.summary}` : issue.summary}
            </h3>
            <IssueStatus status={issue.status} />
          </div>
        }
        actions={<IssueInfoButton issue={issue} />}
      >
        <Row>
          <Col className="mw-450px">
            <Field
              label={translate('Caller')}
              value={issue.caller_full_name}
              isStuck
              labelClass="min-w-100px"
              className="fs-7"
            />
          </Col>
          <Col>
            <Field
              label={translate('Request type')}
              value={issue.type}
              isStuck
              labelClass="min-w-100px"
              className="fs-7"
            />
          </Col>
        </Row>
        <Row>
          <Col className="mw-450px">
            <Field
              label={translate('Created')}
              value={translate('{relative} ago, {date}', {
                relative: formatRelative(issue.created),
                date: formatDateTime(issue.created),
              })}
              isStuck
              labelClass="min-w-100px"
              className="fs-7"
            />
          </Col>
          <Col>
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
                isStuck
                labelClass="min-w-100px"
                className="fs-7"
              />
            )}
          </Col>
        </Row>
      </PublicDashboardHero>

      <Card className="card-bordered mb-5">
        <Card.Header>
          <Card.Title>{translate('Description')}</Card.Title>
        </Card.Header>
        <Card.Body>
          {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE === 'atlassian' ? (
            <FormattedJira text={linkify(issue?.description)} />
          ) : (
            <FormattedHtml html={linkify(issue?.description)} />
          )}
        </Card.Body>
      </Card>

      <IssueCommentsContainer issue={issue} />
      <IssueAttachmentsContainer issue={issue} />
    </>
  );
};
