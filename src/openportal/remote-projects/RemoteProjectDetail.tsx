import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { Card } from 'react-bootstrap';
import { openportalRemoteProjectsRetrieve } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { ExternalLink } from '@/core/ExternalLink';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { DetailsDiff } from '@/openportal/DetailsDiff';
import { Field } from '@/resource/summary/Field';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { RemoteProjectActions } from './RemoteProjectActions';
import { RemoteProjectAuditLog } from './RemoteProjectAuditLog';
import { RemoteProjectStateField } from './RemoteProjectStateField';

const membershipControlLabels: Record<string, string> = {
  open: translate('Open'),
  members_only: translate('Members only'),
  roles_only: translate('Roles only'),
  locked: translate('Locked'),
};

const LinkField = ({
  label,
  link,
}: {
  label: string;
  link?: { id?: string; url?: string } | null;
}) => {
  if (!link || (!link.id && !link.url)) {
    return <Field label={label} />;
  }
  return (
    <Field
      label={label}
      value={
        link.url ? (
          <ExternalLink url={link.url} label={link.id || link.url} />
        ) : (
          link.id
        )
      }
    />
  );
};

export const RemoteProjectDetail = () => {
  const {
    params: { remoteProjectUuid },
  } = useCurrentStateAndParams();

  const customer = useCustomer();
  const user = useUser();
  const canEdit = checkIsOwnerOrStaff(customer, user) || user?.is_support;

  const {
    data: row,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['RemoteProjectDetail', remoteProjectUuid],
    queryFn: () =>
      openportalRemoteProjectsRetrieve({
        path: { uuid: remoteProjectUuid },
      }).then((r) => r.data),
    staleTime: STALE_TIME,
  });

  useTitle(
    row?.current_project_name || translate('Remote project'),
    '',
    'browser',
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !row) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h3 className="mb-0">
              {row.current_project_name || translate('Unnamed project')}
            </h3>
            {canEdit && <RemoteProjectActions row={row} refetch={refetch} />}
          </div>

          <Field
            label={translate('State')}
            value={
              row.error_message ? (
                <span title={row.error_message}>
                  <RemoteProjectStateField project={row} />
                </span>
              ) : (
                <RemoteProjectStateField project={row} />
              )
            }
          />
          <Field
            label={translate('Destination')}
            value={renderFieldOrDash(row.destination)}
          />
          <Field
            label={translate('Identifier')}
            value={renderFieldOrDash(row.identifier)}
          />
          <Field
            label={translate('Current allocation')}
            value={renderFieldOrDash(row.current_allocation)}
          />
          <Field
            label={translate('Pending allocation')}
            value={renderFieldOrDash(row.pending_allocation)}
          />
          <Field
            label={translate('Membership control')}
            value={
              row.membership_control
                ? membershipControlLabels[row.membership_control] ||
                  row.membership_control
                : membershipControlLabels.open
            }
          />
          <Field
            label={translate('Allowed domains')}
            value={
              row.allowed_domains && row.allowed_domains.length > 0
                ? row.allowed_domains.join(', ')
                : translate('All domains allowed')
            }
          />
          <Field
            label={translate('Earliest approve')}
            value={
              row.earliest_approve
                ? formatDateTime(row.earliest_approve)
                : undefined
            }
          />
          <Field
            label={translate('Last contact')}
            value={
              row.last_contact_time
                ? formatDateTime(row.last_contact_time)
                : undefined
            }
          />
          <Field
            label={translate('Created')}
            value={row.created ? formatDateTime(row.created) : undefined}
          />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">{translate('Links')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <LinkField label={translate('Award')} link={row.link_award} />
          <LinkField label={translate('Funding call')} link={row.link_call} />
          <LinkField
            label={translate('Project page')}
            link={row.link_project}
          />
          <LinkField label={translate('Renewal')} link={row.link_renewal} />
        </Card.Body>
      </Card>

      {(row.last_sent_details || row.last_confirmed_details) && (
        <Card className="mb-4">
          <Card.Body>
            <details>
              <summary className="fw-semibold cursor-pointer">
                {translate('Sync details')}
                {!row.last_confirmed_details && (
                  <Badge variant="secondary" pill outline className="ms-2">
                    {translate('Not yet confirmed')}
                  </Badge>
                )}
              </summary>
              <div className="mt-3">
                <DetailsDiff
                  before={row.last_sent_details}
                  after={row.last_confirmed_details}
                  beforeLabel={translate('Last sent')}
                  afterLabel={translate('Last confirmed')}
                />
              </div>
            </details>
          </Card.Body>
        </Card>
      )}

      {row.pending_details && (
        <Card className="mb-4">
          <Card.Body>
            <details>
              <summary className="fw-semibold cursor-pointer">
                {translate('Pending sync')}
              </summary>
              <div className="mt-3">
                <Field
                  label={translate('Pending since')}
                  value={
                    row.pending_since
                      ? formatDateTime(row.pending_since)
                      : undefined
                  }
                />
                <DetailsDiff
                  before={row.last_confirmed_details}
                  after={row.pending_details}
                  beforeLabel={translate('Currently confirmed')}
                  afterLabel={translate('Pending')}
                />
              </div>
            </details>
          </Card.Body>
        </Card>
      )}

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">{translate('Notes')}</Card.Title>
        </Card.Header>
        <Card.Body>
          {row.notes && row.notes.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {row.notes.map((note, index) => (
                <div key={index} className="border-bottom pb-2">
                  <div className="text-muted small">
                    {note.author} &middot; {formatDateTime(note.timestamp)}
                  </div>
                  <div>{note.text}</div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted">{translate('No notes yet.')}</span>
          )}
        </Card.Body>
      </Card>

      <RemoteProjectAuditLog remoteProjectUuid={row.uuid} hideTitle />
    </>
  );
};
