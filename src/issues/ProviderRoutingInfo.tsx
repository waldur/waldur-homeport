import { FC, ReactNode } from 'react';
import { Issue } from 'waldur-js-client';

import {
  Badge,
  PropertyItem,
  PropertyList,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'waldur-ui';

import { Link } from '@/core/Link';
import { OrganizationLink } from '@/customer/list/OrganizationLink';
import { translate } from '@/i18n';

import { IssueStatus } from './IssueStatus';
import { providerTicketInfo } from './providerTicketInfo';

/** Operator-side panel summarising a ticket's provider routing state. */
export const ProviderRoutingInfo: FC<{ issue: Issue }> = ({ issue }) => {
  if (!issue.is_routed) {
    return null;
  }
  const value = providerTicketInfo(issue);

  const childKey = value('child_ticket_key');
  const childUuid = value('child_issue_uuid');
  const childStatus = value('child_ticket_status');

  const providerName = value('provider_name');
  const providerCustomerUuid = value('provider_customer_uuid');
  // OrganizationLink links only when the viewer has access to the org, else
  // it renders the name as plain text.
  const provider: ReactNode =
    providerName && providerCustomerUuid ? (
      <OrganizationLink uuid={providerCustomerUuid}>
        {providerName}
      </OrganizationLink>
    ) : (
      providerName
    );
  // This panel only renders for staff/support (see IssueDetailsContent), who
  // can open the routed child issue directly; link it when we know its uuid.
  const providerTicket: ReactNode =
    childKey && childUuid ? (
      <Link
        state="support.detail"
        params={{ issue_uuid: childUuid }}
        label={childKey}
      />
    ) : (
      childKey
    );

  const rows: Array<[string, ReactNode]> = [
    [translate('Provider'), provider],
    [translate('Backend'), value('backend_type')],
    [translate('Provider ticket'), providerTicket],
    [
      translate('Provider status'),
      childStatus ? <IssueStatus status={childStatus} /> : null,
    ],
  ];

  return (
    <Card bordered className="mb-4">
      <CardHeader>
        <CardTitle as="div">{translate('Provider routing')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <Badge variant="info" shape="pill" tone="outline">
            {translate('Routed')}
          </Badge>
          {issue.is_escalated && (
            <Badge variant="danger" shape="pill" tone="outline">
              {translate('Escalated')}
            </Badge>
          )}
          {/* SLA breach is shown by IssueSlaBadge in the detail header; not
              repeated here to avoid a duplicate badge. */}
        </div>
        <PropertyList variant="summary" termWidth="sm">
          {issue.is_escalated && issue.escalation_reason && (
            <PropertyItem
              label={translate('Escalation reason')}
              value={issue.escalation_reason}
              className="text-sm"
            />
          )}
          {rows
            .filter(([, v]) => v)
            .map(([label, v]) => (
              <PropertyItem
                key={label}
                label={label}
                value={v}
                className="text-sm"
              />
            ))}
        </PropertyList>
      </CardContent>
    </Card>
  );
};
