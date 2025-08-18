import { Template } from 'waldur-js-client';

import { IssueTemplateTypeOptions } from '@waldur/administration/utils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { IssueTemplateCreateButton } from './IssueTemplateCreateButton';
import { IssueTemplateRowActions } from './IssueTemplateRowActions';

const renderType = ({ row }) => (
  <StateIndicator
    variant={
      row.issue_type === 'INFORMATIONAL'
        ? 'success'
        : row.issue_type === 'SERVICE_REQUEST' ||
            row.issue_type === 'CHANGE_REQUEST'
          ? 'warning'
          : 'danger'
    }
    label={
      IssueTemplateTypeOptions.find((opt) => opt.value === row.issue_type)
        ?.label || row.issue_type
    }
    outline
    pill
  />
);

export const AdministrationIssueTemplatesList = () => {
  const tableProps = useTable({
    table: 'issueTemplates',
    fetchData: createFetcher('support-templates'),
  });
  const columns: Column<Template>[] = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      copyField: (row) => row.name,
      keys: ['name'],
      id: 'name',
    },
    {
      title: translate('Description'),
      render: ({ row }) => row.description,
      keys: ['description'],
      id: 'description',
    },
    {
      title: translate('Type'),
      render: renderType,
      keys: ['issue_type'],
      id: 'issue_type',
    },
    {
      title: translate("Attachments' count"),
      render: ({ row }) => row.attachments.length,
      keys: ['attachments'],
      id: 'attachments',
    },
  ];

  return (
    <Table
      {...tableProps}
      tableActions={<IssueTemplateCreateButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <IssueTemplateRowActions refetch={tableProps.fetch} row={row} />
      )}
      columns={columns}
    />
  );
};
