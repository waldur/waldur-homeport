import { FC } from 'react';
import {
  CallResourceTemplate,
  proposalProtectedCallsResourceTemplatesList,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { callLockedTooltip } from '@/proposals/workflow/constants';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ResourceTemplateCreateButton } from './ResourceTemplateCreateButton';
import { ResourceTemplateDeleteButton } from './ResourceTemplateDeleteButton';
import { ResourceTemplateEditButton } from './ResourceTemplateEditButton';
import { ResourceTemplateExpandableRow } from './ResourceTemplateExpandableRow';

interface CallResourceTemplatesProps {
  call: Call;
  isReadOnly?: boolean;
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
          disabled={props.isReadOnly}
          tooltip={props.isReadOnly ? callLockedTooltip() : undefined}
        />
      }
      rowActions={({ row, fetch }) =>
        props.isReadOnly ? (
          <ActionsDropdown disabled tooltip={callLockedTooltip()} />
        ) : (
          <RowActions row={row} fetch={fetch} call={props.call} />
        )
      }
      expandableRow={ResourceTemplateExpandableRow}
      showPageSizeSelector
    />
  );
};
