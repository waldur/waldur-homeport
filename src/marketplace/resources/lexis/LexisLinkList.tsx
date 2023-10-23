import React, { FunctionComponent } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { LexisLinkDeleteButton } from '@waldur/marketplace/resources/lexis/LexisLinkDeleteButton';
import { PublicResourceLink } from '@waldur/marketplace/resources/list/PublicResourceLink';
import { Table, connectTable, createFetcher } from '@waldur/table';

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Resource'),
      render: ({ row }) => (
        <PublicResourceLink
          row={
            props.resource || {
              uuid: row.resource_uuid,
              backend_id: row.backend_id,
              end_date: row.end_date,
              name: row.resource_name,
            }
          }
          customer={props.customer}
        />
      ),
    },
    {
      title: translate('Robot account'),
      render: ({ row }) =>
        row.robot_account_username ? (
          <CopyToClipboardContainer value={row.username} />
        ) : (
          'N/A'
        ),
    },
    {
      title: translate('Robot account type'),
      render: ({ row }) => row.robot_account_type || 'N/A',
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <StateIndicator
          label={translate(row.state)}
          variant={
            row.state === 'erred'
              ? 'danger'
              : row.state === 'pending'
              ? 'warning'
              : 'primary'
          }
        />
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('LEXIS links')}
      hasActionBar={false}
      hoverableRow={({ row }) => (
        <LexisLinkDeleteButton row={row} refetch={props.fetch} />
      )}
    />
  );
};

const mapPropsToFilter = ({ resource }) => {
  return { resource_uuid: resource.uuid };
};

export const TableOptions = {
  table: 'lexis-links',
  fetchData: createFetcher('lexis-links'),
  mapPropsToFilter,
};

const enhance = connectTable(TableOptions);

export const LexisLinkList = enhance(
  TableComponent,
) as React.ComponentType<any>;
