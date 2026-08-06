import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { Card } from 'react-bootstrap';
import { openportalManagedProjectsRetrieveGet } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { STALE_TIME } from '@/core/constants';
import { formatDate, formatDateTime } from '@/core/dateUtils';
import { ExternalLink } from '@/core/ExternalLink';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { Field } from '@/resource/summary/Field';
import { renderFieldOrDash } from '@/table/utils';

import { ManagedProjectActions } from './ManagedProjectActions';
import { ManagedProjectAuditLog } from './ManagedProjectAuditLog';
import { isEmbargoed } from './utils';

const membershipControlLabels: Record<string, string> = {
  open: translate('Open'),
  members_only: translate('Members only'),
  roles_only: translate('Roles only'),
  locked: translate('Locked'),
};

const renderOffering = (destination: string) => {
  if (!destination) {
    return renderFieldOrDash(destination);
  }
  const parts = destination.split('.');
  return parts[parts.length - 1];
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

export const ManagedProjectDetail = () => {
  const {
    params: { identifier, destination },
  } = useCurrentStateAndParams();

  const {
    data: row,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['ManagedProjectDetail', identifier, destination],
    queryFn: () =>
      openportalManagedProjectsRetrieveGet({
        path: { identifier, destination },
      }).then((r) => r.data),
    staleTime: STALE_TIME,
  });

  useTitle(row?.details?.name || translate('Managed project'), '', 'browser');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !row) {
    return <LoadingErred loadData={refetch} />;
  }

  const details = row.details;

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h3 className="mb-0">
              {details?.name || row.identifier || translate('Unnamed project')}
            </h3>
            <ManagedProjectActions project={row} refetch={refetch} />
          </div>

          <Field
            label={translate('State')}
            value={
              <>
                {row.state}
                {isEmbargoed(row) && (
                  <Badge variant="warning" pill outline className="ms-1">
                    {translate('Embargoed')}
                  </Badge>
                )}
              </>
            }
          />
          <Field
            label={translate('Project')}
            value={
              row.project_data ? (
                <Link
                  state="project.dashboard"
                  params={{ uuid: row.project_data.uuid }}
                >
                  {row.project_data.name}
                </Link>
              ) : (
                translate('Not attached to a local project')
              )
            }
          />
          <Field
            label={translate('Identifier')}
            value={renderFieldOrDash(row.identifier)}
          />
          <Field
            label={translate('Local identifier')}
            value={renderFieldOrDash(row.local_identifier)}
          />
          <Field
            label={translate('Offering')}
            value={renderOffering(row.destination)}
          />
          <Field
            label={translate('Project template')}
            value={renderFieldOrDash(row.project_template_data?.name)}
          />
          <Field
            label={translate('Description')}
            value={renderFieldOrDash(details?.description)}
          />
          <Field
            label={translate('Allocation')}
            value={renderFieldOrDash(details?.allocation)}
          />
          <Field
            label={translate('Start date')}
            value={
              details?.start_date ? formatDate(details.start_date) : undefined
            }
          />
          <Field
            label={translate('End date')}
            value={details?.end_date ? formatDate(details.end_date) : undefined}
          />
          <Field
            label={translate('Earliest approve')}
            value={
              details?.earliest_approve
                ? formatDateTime(details.earliest_approve)
                : undefined
            }
          />
          <Field
            label={translate('Reviewed by')}
            value={renderFieldOrDash(row.reviewed_by_full_name)}
          />
          <Field
            label={translate('Review comment')}
            value={renderFieldOrDash(row.review_comment)}
          />
          <Field
            label={translate('Created')}
            value={row.created ? formatDateTime(row.created) : undefined}
          />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">{translate('Members')}</Card.Title>
        </Card.Header>
        <Card.Body>
          {details?.members && Object.keys(details.members).length > 0 ? (
            <div className="d-flex flex-column gap-1">
              {Object.entries(details.members).map(([email, role]) => (
                <Field key={email} label={email} value={role} />
              ))}
            </div>
          ) : (
            <span className="text-muted">
              {translate('No members assigned.')}
            </span>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">{translate('Links')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <LinkField label={translate('Award')} link={details?.award} />
          <LinkField label={translate('Funding call')} link={details?.call} />
          <LinkField
            label={translate('Project page')}
            link={details?.project_link}
          />
          <LinkField label={translate('Renewal')} link={details?.renewal} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">
            {translate('Access control')}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Field
            label={translate('Membership control')}
            value={
              details?.membership_control
                ? membershipControlLabels[details.membership_control] ||
                  details.membership_control
                : membershipControlLabels.open
            }
          />
          <Field
            label={translate('Allowed domains')}
            value={
              details?.allowed_domains && details.allowed_domains.length > 0
                ? details.allowed_domains.join(', ')
                : translate('All domains allowed')
            }
          />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">{translate('Notes')}</Card.Title>
        </Card.Header>
        <Card.Body>
          {details?.notes && details.notes.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {details.notes.map((note, index) => (
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

      <ManagedProjectAuditLog
        identifier={row.identifier}
        destination={row.destination}
        hideTitle
      />
    </>
  );
};
