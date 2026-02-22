import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import {
  BroadcastMessage,
  broadcastMessagesList,
  BroadcastMessagesListData,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import {
  BroadcastMessagesFilter,
  selectBroadcastMessagesFilter,
} from '@waldur/table/generated/BroadcastMessagesFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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
  const filter = useSelector(selectBroadcastMessagesFilter);
  const props = useTable({
    table: 'broadcast',
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
    />
  );
};
