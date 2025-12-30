import { FC, useEffect } from 'react';
import {
  MaintenanceAnnouncement,
  MaintenanceAnnouncementOffering,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { InternalNotes } from './InternalNotesField';
import { MAINTENANCE_IMPACT_LEVEL } from './types';

export const MaintenanceExpandableRow: FC<{
  row: MaintenanceAnnouncement;
}> = ({ row: maintenance }) => {
  const tableProps = useTable({
    table: 'MaintenanceAnnouncement-' + maintenance.uuid,
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
      <InternalNotes maintenance={maintenance} space={5} />
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
            render: ({ row }) => MAINTENANCE_IMPACT_LEVEL[row.impact_level],
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
