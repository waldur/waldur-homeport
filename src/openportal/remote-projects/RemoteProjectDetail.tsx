import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { openportalRemoteProjectsRetrieve } from 'waldur-js-client';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { DetailsDiff } from '@/openportal/DetailsDiff';
import { getMembershipControlLabels } from '@/openportal/membershipControl';
import { propVal } from '@/property/propertyFields';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { RemoteProjectActions } from './RemoteProjectActions';
import { RemoteProjectAuditLog } from './RemoteProjectAuditLog';
import { RemoteProjectStateField } from './RemoteProjectStateField';

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
      <div className="card mb-3">
        <div className="card-body">
          <div className="flex justify-between items-start mb-2.5">
            <h3 className="mb-0">
              {row.current_project_name || translate('Unnamed project')}
            </h3>
            {canEdit && <RemoteProjectActions row={row} refetch={refetch} />}
          </div>

          <PropertyList variant="summary" hideIfEmpty={false}>
            <PropertyItem
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
            <PropertyItem
              label={translate('Destination')}
              value={row.destination}
            />
            <PropertyItem
              label={translate('Identifier')}
              value={row.identifier}
            />
            <PropertyItem
              label={translate('Current allocation')}
              value={row.current_allocation}
            />
            <PropertyItem
              label={translate('Pending allocation')}
              value={row.pending_allocation}
            />
            <PropertyItem
              label={translate('Membership control')}
              value={propVal.enum(row.membership_control || 'open', {
                labels: getMembershipControlLabels(),
              })}
            />
            <PropertyItem
              label={translate('Allowed domains')}
              value={propVal.list(row.allowed_domains)}
              placeholder={translate('All domains allowed')}
            />
            <PropertyItem
              label={translate('Earliest approve')}
              value={propVal.date(row.earliest_approve, {
                precision: 'datetime',
              })}
            />
            <PropertyItem
              label={translate('Last contact')}
              value={propVal.date(row.last_contact_time, {
                precision: 'datetime',
              })}
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
          <div className="card-title mb-0">{translate('Links')}</div>
        </div>
        <div className="card-body">
          <LinkField label={translate('Award')} link={row.link_award} />
          <LinkField label={translate('Funding call')} link={row.link_call} />
          <LinkField
            label={translate('Project page')}
            link={row.link_project}
          />
          <LinkField label={translate('Renewal')} link={row.link_renewal} />
        </div>
      </div>

      {(row.last_sent_details || row.last_confirmed_details) && (
        <div className="card mb-3">
          <div className="card-body">
            <details>
              <summary className="cursor-pointer">
                {translate('Sync details')}
                {!row.last_confirmed_details && (
                  <Badge
                    variant="secondary"
                    shape="pill"
                    tone="outline"
                    className="ms-1.5"
                  >
                    {translate('Not yet confirmed')}
                  </Badge>
                )}
              </summary>
              <div className="mt-2.5">
                <DetailsDiff
                  before={row.last_sent_details}
                  after={row.last_confirmed_details}
                  beforeLabel={translate('Last sent')}
                  afterLabel={translate('Last confirmed')}
                />
              </div>
            </details>
          </div>
        </div>
      )}

      {row.pending_details && (
        <div className="card mb-3">
          <div className="card-body">
            <details>
              <summary className="cursor-pointer">
                {translate('Pending sync')}
              </summary>
              <div className="mt-2.5">
                <PropertyList variant="summary">
                  <PropertyItem
                    label={translate('Pending since')}
                    value={propVal.date(row.pending_since, {
                      precision: 'datetime',
                    })}
                  />
                </PropertyList>
                <DetailsDiff
                  before={row.last_confirmed_details}
                  after={row.pending_details}
                  beforeLabel={translate('Currently confirmed')}
                  afterLabel={translate('Pending')}
                />
              </div>
            </details>
          </div>
        </div>
      )}

      <div className="card mb-3">
        <div className="card-header">
          <div className="card-title mb-0">{translate('Notes')}</div>
        </div>
        <div className="card-body">
          {row.notes && row.notes.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {row.notes.map((note, index) => (
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

      <RemoteProjectAuditLog remoteProjectUuid={row.uuid} hideTitle />
    </>
  );
};
