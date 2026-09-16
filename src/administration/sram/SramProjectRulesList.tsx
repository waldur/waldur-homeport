import { FC } from 'react';
import { SramProjectRule, sramProjectRulesList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { SramRuleActions } from './SramRuleActions';
import { SramRuleCreateButton } from './SramRuleCreateButton';
import {
  getOptionLabel,
  getProjectFieldOptions,
  getProjectMatchOptions,
  getSourceKindOptions,
  toStringList,
} from './utils';

const ListCell: FC<{ value: unknown; emptyLabel: string }> = ({
  value,
  emptyLabel,
}) => {
  const items = toStringList(value);
  if (!items.length) {
    return <span className="text-muted">{emptyLabel}</span>;
  }
  return (
    <span className="d-inline-flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item} variant="default" size="sm" outline>
          {item}
        </Badge>
      ))}
    </span>
  );
};

export const SramProjectRulesList: FC = () => {
  const tableProps = useTable({
    table: 'SramProjectRulesList',
    fetchData: createFetcher(sramProjectRulesList),
  });

  const columns: Column<SramProjectRule>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => <>{row.name}</>,
      id: 'name',
      copyField: (row) => row.name,
    },
    {
      title: translate('State'),
      render: ({ row }) =>
        row.is_active === false ? (
          <Badge variant="default" pill outline>
            {translate('Inactive')}
          </Badge>
        ) : (
          <Badge variant="success" pill outline>
            {translate('Active')}
          </Badge>
        ),
      id: 'is_active',
    },
    {
      title: translate('Source'),
      render: ({ row }) =>
        renderFieldOrDash(
          getOptionLabel(getSourceKindOptions(), row.source_kind),
        ),
      id: 'source_kind',
    },
    {
      title: translate('Labels'),
      render: ({ row }) => (
        <ListCell value={row.labels} emptyLabel={translate('Any')} />
      ),
      id: 'labels',
    },
    {
      title: translate('Group short names'),
      render: ({ row }) => (
        <ListCell
          value={row.group_short_name_patterns}
          emptyLabel={translate('Any')}
        />
      ),
      id: 'group_short_name_patterns',
    },
    {
      title: translate('Projects'),
      render: ({ row }) => (
        <div>
          <div className="text-muted small">
            {translate('{field}, {match}', {
              field: getOptionLabel(
                getProjectFieldOptions(),
                row.project_field,
              ),
              match: getOptionLabel(
                getProjectMatchOptions(),
                row.project_match,
              ),
            })}
          </div>
          <code>{row.project_pattern}</code>
        </div>
      ),
      id: 'project_pattern',
    },
    {
      title: translate('Project role'),
      render: ({ row }) =>
        renderFieldOrDash(
          row.project_role_description || row.project_role_name,
        ),
      id: 'project_role',
    },
  ];

  return (
    <Table<SramProjectRule>
      {...tableProps}
      columns={columns}
      title={translate('Project rules')}
      verboseName={translate('SRAM project rules')}
      emptyMessage={translate(
        'No project rules yet. Add one to grant project roles to the members of SRAM collaborations and groups.',
      )}
      placeholderActions={<SramRuleCreateButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <SramRuleActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={<SramRuleCreateButton refetch={tableProps.fetch} />}
      showPageSizeSelector
    />
  );
};
