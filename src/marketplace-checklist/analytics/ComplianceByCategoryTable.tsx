import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

const complianceByCategory = [
  { category: 'Security Fundamentals', organizations: 34, compliance: '82%' },
  {
    category: 'Data Protection & Privacy',
    organizations: 41,
    compliance: '73%',
  },
  { category: 'Operational Excellence', organizations: 6, compliance: '24%' },
  { category: 'Security Fundamentals', organizations: 19, compliance: '92%' },
  {
    category: 'Data Protection & Privacy',
    organizations: 28,
    compliance: '71%',
  },
  { category: 'Operational Excellence', organizations: 39, compliance: '62%' },
  { category: 'Security Fundamentals', organizations: 16, compliance: '32%' },
];

export const ComplianceByCategoryTable = () => {
  const tableProps = useTable({
    table: 'ComplianceByCategory',
    fetchData: () => Promise.resolve({ rows: complianceByCategory }),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Compliance by category')}
      columns={[
        { title: translate('Category'), render: ({ row }) => row.category },
        {
          title: translate('Organizations'),
          render: ({ row }) => row.organizations,
        },
        { title: translate('Compliance'), render: ({ row }) => row.compliance },
      ]}
      hideRefresh
      minHeight="auto"
      verboseName={translate('Category')}
      headerClassName="min-h-60px"
      className="h-100"
    />
  );
};
