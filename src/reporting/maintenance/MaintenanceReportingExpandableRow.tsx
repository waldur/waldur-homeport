import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  MaintenanceAnnouncement,
  MaintenanceAnnouncementOffering,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { isOwnerOrStaff } from '@waldur/workspace/selectors';

import { IMPACT_LABELS } from './utils';

export const MaintenanceReportingExpandableRow: FC<{
  row: MaintenanceAnnouncement;
}> = ({ row: maintenance }) => {
  const showInternalNotes = useSelector(isOwnerOrStaff);

  const tableProps = useTable({
    table: 'MaintenanceReportingExpandableRow-' + maintenance.uuid,
    fetchData: () =>
      Promise.resolve({
        rows: maintenance.affected_offerings,
      }),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [maintenance.affected_offerings]);

  return (
    <ExpandableContainer>
      {showInternalNotes && maintenance.internal_notes && (
        <Field
          label={
            <>
              {translate('Internal notes')}:
              <span className="text-quaternary d-block">
                {translate('Providers/staff visible only')}
              </span>
            </>
          }
          value={renderFieldOrDash(maintenance.internal_notes)}
          space={5}
        />
      )}
      {maintenance.message && (
        <Field
          label={translate('Message')}
          value={maintenance.message}
          space={5}
        />
      )}
      <Table<MaintenanceAnnouncementOffering>
        {...tableProps}
        columns={[
          {
            title: translate('Offering name'),
            render: ({ row }) => (
              <span className="text-dark">{row.offering_name}</span>
            ),
          },
          {
            title: translate('Impact'),
            render: ({ row }) => IMPACT_LABELS[row.impact_level || 1] || '—',
          },
          {
            title: translate('Description'),
            render: ({ row }) => renderFieldOrDash(row.impact_description),
          },
        ]}
        verboseName={translate('Affected offerings')}
        hasActionBar={false}
        minHeight="auto"
        equalColWidth
      />
    </ExpandableContainer>
  );
};
