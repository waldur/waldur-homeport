import { CallTemplate, callTemplatesList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { CallTemplateOrigin } from '@/proposals/templates/CallTemplateOrigin';
import { scenarioCount } from '@/proposals/workflow-description/scenarios/checks';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { CallTemplateCreateButton } from './CallTemplateCreateButton';
import { CallTemplateExpandableRow } from './CallTemplateExpandableRow';
import { CallTemplateLoadPresetButton } from './CallTemplateLoadPresetButton';
import { CallTemplatePublishToggle } from './CallTemplatePublishToggle';
import { CallTemplateRowActions } from './CallTemplateRowActions';

const TemplateOrigin = ({ row }: { row: CallTemplate }) =>
  row.origin ? (
    <CallTemplateOrigin
      origin={row.origin}
      referenceTitle={row.preset?.reference_title}
    />
  ) : (
    DASH_ESCAPE_CODE
  );

export const CallTemplatesList = () => {
  const tableProps = useTable({
    table: 'call-templates',
    fetchData: createFetcher(callTemplatesList),
    queryField: 'name',
  });
  return (
    <Table<CallTemplate>
      {...tableProps}
      title={translate('Call templates')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Version'),
          render: ({ row }) => row.schema_version,
        },
        {
          title: translate('Published'),
          render: ({ row }) => (
            <CallTemplatePublishToggle row={row} refetch={tableProps.fetch} />
          ),
        },
        {
          title: translate('Scenarios'),
          ellipsis: false,
          render: ({ row }) =>
            row.scenarios?.length ? (
              <span className="whitespace-nowrap">
                {scenarioCount(row.scenarios.length)}
              </span>
            ) : null,
        },
        {
          title: translate('Origin'),
          render: TemplateOrigin,
        },
        {
          title: translate('Modified'),
          render: ({ row }) => formatDateTime(row.modified),
          orderField: 'modified',
        },
      ]}
      verboseName={translate('call templates')}
      tableActions={
        <>
          <CallTemplateLoadPresetButton refetch={tableProps.fetch} />
          <CallTemplateCreateButton refetch={tableProps.fetch} />
        </>
      }
      rowActions={({ row }) => (
        <CallTemplateRowActions row={row} refetch={tableProps.fetch} />
      )}
      expandableRow={CallTemplateExpandableRow}
      hasQuery
    />
  );
};
