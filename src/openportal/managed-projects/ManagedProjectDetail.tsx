import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { openportalManagedProjectsRetrieveGet } from 'waldur-js-client';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { getMembershipControlLabels } from '@/openportal/membershipControl';
import { propVal } from '@/property/propertyFields';

import { ManagedProjectActions } from './ManagedProjectActions';
import { ManagedProjectAuditLog } from './ManagedProjectAuditLog';
import { isEmbargoed } from './utils';

const LinkField = ({
  label,
  link,
}: {
  label: string;
  link?: { id?: string; url?: string } | null;
}) =>
  link?.url ? (
    <PropertyItem
      label={label}
      value={propVal.url(link.url, { text: link.id || link.url })}
    />
  ) : (
    <PropertyItem label={label} value={link?.id} />
  );

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
      <div className="card mb-3">
        <div className="card-body">
          <div className="flex justify-between items-start mb-2.5">
            <h3 className="mb-0">
              {details?.name || row.identifier || translate('Unnamed project')}
            </h3>
            <ManagedProjectActions project={row} refetch={refetch} />
          </div>

          <PropertyList variant="summary" hideIfEmpty={false}>
            <PropertyItem
              label={translate('State')}
              value={
                <>
                  {row.state}
                  {isEmbargoed(row) && (
                    <Badge
                      variant="warning"
                      shape="pill"
                      tone="outline"
                      className="ms-1"
                    >
                      {translate('Embargoed')}
                    </Badge>
                  )}
                </>
              }
            />
            <PropertyItem
              label={translate('Project')}
              value={propVal.link(row.project_data?.name, {
                state: 'project.dashboard',
                params: { uuid: row.project_data?.uuid },
              })}
              placeholder={translate('Not attached to a local project')}
            />
            <PropertyItem
              label={translate('Identifier')}
              value={row.identifier}
            />
            <PropertyItem
              label={translate('Local identifier')}
              value={row.local_identifier}
            />
            <PropertyItem
              label={translate('Offering')}
              value={row.destination?.split('.').pop()}
            />
            <PropertyItem
              label={translate('Project template')}
              value={row.project_template_data?.name}
            />
            <PropertyItem
              label={translate('Description')}
              value={details?.description}
            />
            <PropertyItem
              label={translate('Allocation')}
              value={details?.allocation}
            />
            <PropertyItem
              label={translate('Start date')}
              value={propVal.date(details?.start_date)}
            />
            <PropertyItem
              label={translate('End date')}
              value={propVal.date(details?.end_date)}
            />
            <PropertyItem
              label={translate('Earliest approve')}
              value={propVal.date(details?.earliest_approve, {
                precision: 'datetime',
              })}
            />
            <PropertyItem
              label={translate('Reviewed by')}
              value={row.reviewed_by_full_name}
            />
            <PropertyItem
              label={translate('Review comment')}
              value={row.review_comment}
            />
            <PropertyItem
              label={translate('Created')}
              value={propVal.date(row.created, { precision: 'datetime' })}
            />
          </PropertyList>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <div className="card-title mb-0">{translate('Members')}</div>
        </div>
        <div className="card-body">
          {details?.members && Object.keys(details.members).length > 0 ? (
            <PropertyList variant="summary" className="flex flex-col gap-1">
              {Object.entries(details.members).map(([email, role]) => (
                <PropertyItem key={email} label={email} value={role} />
              ))}
            </PropertyList>
          ) : (
            <span className="text-quaternary">
              {translate('No members assigned.')}
            </span>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <div className="card-title mb-0">{translate('Links')}</div>
        </div>
        <div className="card-body">
          <LinkField label={translate('Award')} link={details?.award} />
          <LinkField label={translate('Funding call')} link={details?.call} />
          <LinkField
            label={translate('Project page')}
            link={details?.project_link}
          />
          <LinkField label={translate('Renewal')} link={details?.renewal} />
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <div className="card-title mb-0">{translate('Access control')}</div>
        </div>
        <div className="card-body">
          <PropertyList variant="summary">
            <PropertyItem
              label={translate('Membership control')}
              value={propVal.enum(details?.membership_control || 'open', {
                labels: getMembershipControlLabels(),
              })}
            />
            <PropertyItem
              label={translate('Allowed domains')}
              value={propVal.list(details?.allowed_domains)}
              placeholder={translate('All domains allowed')}
            />
          </PropertyList>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <div className="card-title mb-0">{translate('Notes')}</div>
        </div>
        <div className="card-body">
          {details?.notes && details.notes.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {details.notes.map((note, index) => (
                <div key={index} className="border-b border-b-secondary pb-1.5">
                  <div className="text-quaternary small">
                    {note.author} &middot; {formatDateTime(note.timestamp)}
                  </div>
                  <div>{note.text}</div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-quaternary">
              {translate('No notes yet.')}
            </span>
          )}
        </div>
      </div>

      <ManagedProjectAuditLog
        identifier={row.identifier}
        destination={row.destination}
        hideTitle
      />
    </>
  );
};
