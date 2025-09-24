import { FC } from 'react';
import {
  CallResourceTemplate,
  proposalProtectedCallsResourceTemplatesList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ResourceTemplateCreateButton } from './ResourceTemplateCreateButton';
import { ResourceTemplateDeleteButton } from './ResourceTemplateDeleteButton';
import { ResourceTemplateEditButton } from './ResourceTemplateEditButton';
import { ResourceTemplateExpandableRow } from './ResourceTemplateExpandableRow';

interface CallResourceTemplatesProps {
  call: Call;
}

const RowActions = ({ row, fetch, call }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    data={{ call }}
    actions={[ResourceTemplateEditButton, ResourceTemplateDeleteButton]}
  />
);

export const CallResourceTemplates: FC<CallResourceTemplatesProps> = (
  props,
) => {
  const tableProps = useTable({
    table: 'PrivateCallResourceTemplates',
    fetchData: createFetcher(proposalProtectedCallsResourceTemplatesList, {
      path: { uuid: props.call.uuid },
    }),
    queryField: 'name',
  });

  return (
    <Table<CallResourceTemplate>
      {...tableProps}
      id="resource-templates"
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.requested_offering_name}</>,
        },
        {
          title: translate('Plan'),
          render: ({ row }) =>
            renderFieldOrDash(row.requested_offering_plan?.name),
        },
      ]}
      title={translate('Resource templates')}
      verboseName={translate('Resource templates')}
      hasQuery
      tableActions={
        <ResourceTemplateCreateButton
          call={props.call}
          refetch={tableProps.fetch}
        />
      }
      rowActions={({ row, fetch }) => (
        <RowActions row={row} fetch={fetch} call={props.call} />
      )}
      expandableRow={ResourceTemplateExpandableRow}
    />
  );
};
