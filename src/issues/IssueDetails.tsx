import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { supportIssuesRetrieve } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { formatDateTime, formatRelative } from '@waldur/core/dateUtils';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { linkify } from '@waldur/issues/utils';
import { RefreshButton } from '@waldur/marketplace/common/RefreshButton';
import { useBreadcrumbs } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { Field } from '@waldur/resource/summary';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { IssueAttachmentsContainer } from './attachments/IssueAttachmentsContainer';
import { IssueCommentsContainer } from './comments/IssueCommentsContainer';
import { IssueLogButton, IssueSyncButton } from './IssueInfo';
import { IssueStatus } from './IssueStatus';
import { useIssueBreadcrumbItems } from './utils';

const loadIssue = async (issueId: string) => {
  const issue = await supportIssuesRetrieve({ path: { uuid: issueId } });
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
    data: issue,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['Issue', issue_uuid],
    queryFn: () => loadIssue(issue_uuid),
    refetchOnWindowFocus: false,
  });

  const breadcrumbItems = useIssueBreadcrumbItems(issue);

  useBreadcrumbs(breadcrumbItems);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <LoadingErred loadData={refetch} />;
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
        actions={
          <>
            <RefreshButton refetch={refetch} isLoading={isRefetching} />
            <IssueSyncButton issue={issue} refetch={refetch} />
            <IssueLogButton issue={issue} />
          </>
        }
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
        {issue.order_uuid && (
          <Row>
            <Col className="mw-450px">
              <Field
                label={translate('Order')}
                value={
                  <Link
                    state="marketplace-orders.details"
                    params={{ order_uuid: issue.order_uuid }}
                    className="text-link"
                  >
                    {issue.order_resource_name || issue.order_uuid}
                  </Link>
                }
                isStuck
                labelClass="min-w-100px"
                className="fs-7"
              />
            </Col>
          </Row>
        )}
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
