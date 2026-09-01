import { FunctionComponent, ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import { Issue } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDateTime, formatRelative } from '@/core/dateUtils';
import { ExternalLink } from '@/core/ExternalLink';
import { FormattedHtml } from '@/core/FormattedHtml';
import { FormattedJira } from '@/core/FormattedJira';
import { Link } from '@/core/Link';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { translate } from '@/i18n';
import { linkify } from '@/issues/utils';
import { RefreshButton } from '@/marketplace/offerings/update/components/RefreshButton';
import { Field } from '@/resource/summary';
import { useUser } from '@/workspace/hooks';

import { IssueAttachmentsContainer } from './attachments/IssueAttachmentsContainer';
import { AttachResourceButton } from './AttachResourceButton';
import { ChangeStatusButton } from './ChangeStatusButton';
import { IssueCommentsContainer } from './comments/IssueCommentsContainer';
import { EscalateButton } from './EscalateButton';
import { hasProviderRouting, isBasicSupportBackend } from './hooks';
import { IssueLogButton, IssueSyncButton } from './IssueInfo';
import { IssueSlaBadge } from './IssueSlaBadge';
import { IssueStatus } from './IssueStatus';
import { ProviderRoutingInfo } from './ProviderRoutingInfo';
import { RerouteButton } from './RerouteButton';
import { RouteToProviderButton } from './RouteToProviderButton';

interface IssueDetailsContentProps {
  issue: Issue;
  refetch: () => void;
  isRefetching?: boolean;
  context?: 'staff' | 'provider';
  renderActions?: (issue: Issue, refetch: () => void) => ReactNode;
}

/**
 * Presentational body of the request detail view, decoupled from the route so
 * it can render both on the standalone `support.detail` page (via IssueDetails)
 * and inside the expanded Helpdesk drawer's right pane (where there is no route
 * param, title or breadcrumb).
 */
export const IssueDetailsContent: FunctionComponent<
  IssueDetailsContentProps
> = ({ issue, refetch, isRefetching, context = 'staff', renderActions }) => {
  const user = useUser();
  const staffOrSupport = user?.is_staff || user?.is_support;

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
            {(staffOrSupport || context === 'provider') && (
              <IssueSlaBadge issue={issue} />
            )}
            <RefreshButton refetch={refetch} loading={isRefetching} />
          </div>
        }
        actions={
          context === 'provider' ? (
            renderActions?.(issue, refetch)
          ) : (
            <>
              {staffOrSupport && (
                <ChangeStatusButton issue={issue} refetch={refetch} />
              )}
              {/* Nothing to pull for the built-in helpdesk: its sync_issues is
                  a no-op because Waldur is already the source of truth. */}
              {!isBasicSupportBackend() && (
                <IssueSyncButton issue={issue} refetch={refetch} />
              )}
              <IssueLogButton issue={issue} />
              {staffOrSupport && hasProviderRouting() && (
                <>
                  <AttachResourceButton issue={issue} refetch={refetch} />
                  <RouteToProviderButton issue={issue} refetch={refetch} />
                  <RerouteButton issue={issue} refetch={refetch} />
                  <EscalateButton issue={issue} refetch={refetch} />
                </>
              )}
            </>
          )
        }
      >
        <div className="mw-450px">
          <Field
            label={translate('Caller')}
            value={issue.caller_full_name}
            isStuck
            labelClass="min-w-100px"
            className="fs-6"
          />
          <Field
            label={translate('Created')}
            value={translate('{relative} ago, {date}', {
              relative: formatRelative(issue.created),
              date: formatDateTime(issue.created),
            })}
            isStuck
            labelClass="min-w-100px"
            className="fs-6"
          />
          <Field
            label={translate('Request type')}
            value={issue.type}
            isStuck
            labelClass="min-w-100px"
            className="fs-6"
          />
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
              className="fs-6"
            />
          )}
          {issue.order_uuid && (
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
              className="fs-6"
            />
          )}
        </div>
      </PublicDashboardHero>

      {staffOrSupport && hasProviderRouting() && (
        <ProviderRoutingInfo issue={issue} />
      )}

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
