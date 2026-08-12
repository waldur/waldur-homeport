import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import { Issue } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { Link } from '@/core/Link';
import { OrganizationLink } from '@/customer/list/OrganizationLink';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

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
    <Card className="card-bordered mb-5">
      <Card.Header>
        <Card.Title>{translate('Provider routing')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <Badge variant="info" pill outline>
            {translate('Routed')}
          </Badge>
          {issue.is_escalated && (
            <Badge variant="danger" pill outline>
              {translate('Escalated')}
            </Badge>
          )}
          {/* SLA breach is shown by IssueSlaBadge in the detail header; not
              repeated here to avoid a duplicate badge. */}
        </div>
        {issue.is_escalated && issue.escalation_reason && (
          <Field
            label={translate('Escalation reason')}
            value={issue.escalation_reason}
            isStuck
            labelClass="min-w-150px"
            className="fs-6"
          />
        )}
        {rows
          .filter(([, v]) => v)
          .map(([label, v]) => (
            <Field
              key={label}
              label={label}
              value={v}
              isStuck
              labelClass="min-w-150px"
              className="fs-6"
            />
          ))}
      </Card.Body>
    </Card>
  );
};
