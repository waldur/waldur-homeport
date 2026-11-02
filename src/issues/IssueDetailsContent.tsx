import { FunctionComponent, ReactNode } from 'react';
import { Issue } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { ENV } from '@/core/config';
import { formatDateTime, formatRelative } from '@/core/dateUtils';
import { FormattedHtml } from '@/core/FormattedHtml';
import { FormattedJira } from '@/core/FormattedJira';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { translate } from '@/i18n';
import { linkify, withLineBreaks } from '@/issues/utils';
import { RefreshButton } from '@/marketplace/offerings/update/components/RefreshButton';
import { propVal } from '@/property/propertyFields';
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
        containerClassName="mb-4"
        cardBordered
        hideQuickSection
        title={
          <div className="flex flex-wrap items-center gap-2.5">
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
        <div className="max-w-[450px]">
          <PropertyList variant="summary" termWidth="100px">
            <PropertyItem
              label={translate('Caller')}
              value={issue.caller_full_name}
              className="text-sm"
            />
            <PropertyItem
              label={translate('Created')}
              value={translate('{relative} ago, {date}', {
                relative: formatRelative(issue.created),
                date: formatDateTime(issue.created),
              })}
              className="text-sm"
            />
            <PropertyItem
              label={translate('Request type')}
              value={issue.type}
              className="text-sm"
            />
            {issue.link && staffOrSupport && (
              <PropertyItem
                label={translate('Link')}
                value={propVal.url(issue.link, {
                  text: translate('Open in Service Desk'),
                })}
                className="text-sm"
              />
            )}
            {issue.order_uuid && (
              <PropertyItem
                label={translate('Order')}
                value={propVal.link(
                  issue.order_resource_name || issue.order_uuid,
                  {
                    state: 'marketplace-orders.details',
                    params: { order_uuid: issue.order_uuid },
                  },
                )}
                className="text-sm"
              />
            )}
          </PropertyList>
        </div>
      </PublicDashboardHero>

      {staffOrSupport && hasProviderRouting() && (
        <ProviderRoutingInfo issue={issue} />
      )}

      <div className="card card-bordered mb-4">
        <div className="card-header">
          <div className="card-title">{translate('Description')}</div>
        </div>
        <div className="card-body">
          {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE === 'atlassian' ? (
            <FormattedJira text={linkify(issue?.description)} />
          ) : (
            <FormattedHtml html={linkify(withLineBreaks(issue?.description))} />
          )}
        </div>
      </div>

      <IssueCommentsContainer issue={issue} />
      <IssueAttachmentsContainer issue={issue} />
    </>
  );
};
