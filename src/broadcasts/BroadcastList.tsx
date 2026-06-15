import { FunctionComponent, useMemo } from 'react';
import {
  BroadcastMessage,
  broadcastMessagesList,
  BroadcastMessagesListData,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  BroadcastMessagesFilter,
  selectBroadcastMessagesFilter,
  BroadcastMessagesFilterFormId,
} from '@/table/generated/BroadcastMessagesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { BroadcastCreateButton } from './BroadcastCreateButton';
import { BroadcastExpandableRow } from './BroadcastExpandableRow';
import { BroadcastsRowActions } from './BroadcastsRowActions';

const mandatoryFields: BroadcastMessagesListData['query']['field'] = [
  'uuid',
  'author_full_name',
  'subject',
  'state',
  'created',
  'body',
  'query',
  'send_at',
];

const broadcastState = {
  DRAFT: { label: translate('Draft'), color: 'default' },
  SENT: { label: translate('Sent'), color: 'success' },
};

interface BroadcastListProps {
  standalone?: boolean;
}

export const BroadcastList: FunctionComponent<BroadcastListProps> = ({
  standalone = false,
}) => {
  const values = useFilterValues('broadcast');

  const filter = useMemo(() => selectBroadcastMessagesFilter(values), [values]);

  const props = useTable({
    table: 'broadcast',
    syncFiltersToURL: true,
    fetchData: createFetcher(broadcastMessagesList),
    queryField: 'subject',
    mandatoryFields,
    filter,
  });
  return (
    <Table<BroadcastMessage>
      {...props}
      columns={[
        {
          title: translate('Author'),
          render: ({ row }) => <>{row.author_full_name}</>,
          orderField: 'author_full_name',
        },
        {
          title: translate('Subject'),
          render: ({ row }) => <>{row.subject}</>,
          orderField: 'subject',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <StateIndicator
              label={broadcastState[row.state]?.label || row.state}
              variant={broadcastState[row.state]?.color || 'info'}
              outline
              pill
            />
          ),
          filter: 'state',
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
      ]}
      verboseName={translate('broadcasts')}
      tableActions={<BroadcastCreateButton refetch={props.fetch} />}
      filters={<BroadcastMessagesFilter />}
      expandableRow={BroadcastExpandableRow}
      initialPageSize={10}
      showPageSizeSelector={true}
      rowActions={BroadcastsRowActions}
      hasQuery={true}
      title={translate('Broadcasts')}
      standalone={standalone}
      formId={BroadcastMessagesFilterFormId}
    />
  );
};
