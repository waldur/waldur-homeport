import React, { FunctionComponent } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { RobotAccountActions } from './RobotAccountActions';
import { RobotAccountExpandable } from './RobotAccountExpandable';

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Type'),
      render: ({ row }) => row.type || 'N/A',
    },
    {
      title: translate('Username'),
      render: ({ row }) =>
        row.username ? (
          <CopyToClipboardContainer value={row.username} />
        ) : (
          'N/A'
        ),
    },
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <RobotAccountActions refetch={props.fetch} row={row} />
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('robot accounts')}
      hasActionBar={false}
      expandableRow={RobotAccountExpandable}
    />
  );
};

const mapPropsToFilter = ({ resource }) => {
  return { resource: resource.url };
};

export const TableOptions = {
  table: 'marketplace-robot-accounts',
  fetchData: createFetcher('marketplace-robot-accounts'),
  mapPropsToFilter,
};

const enhance = connectTable(TableOptions);

export const RobotAccountList = enhance(
  TableComponent,
) as React.ComponentType<any>;
