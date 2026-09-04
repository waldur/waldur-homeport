import { FC, ReactNode, useMemo } from 'react';

import { CountryFlagIcon } from '@/core/CountryFlagIcon';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AffiliationCountryRow, AffiliationRow } from './useAffiliationReport';

const hero = (content: ReactNode) => (
  <span className="fw-bold text-dark">{content}</span>
);

/** Flag and label share a flex line: the 24px sprite is scaled, not resized,
 * so on the text baseline it hangs low. */
const countryCell = (country: string | null) =>
  country ? (
    <span className="d-flex align-items-center">
      <CountryFlagIcon countryCode={country} size="sm" className="me-2" />
      {country}
    </span>
  ) : (
    renderFieldOrDash(country)
  );

export const AffiliationReportTable: FC<{ rows: AffiliationRow[] }> = ({
  rows,
}) => {
  const tableProps = useTable<AffiliationRow>({
    table: 'AffiliationReportTable',
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });

  const columns = useMemo<Column<AffiliationRow>[]>(
    () => [
      {
        title: translate('Affiliated organization'),
        render: ({ row }) => hero(row.org_name),
        export: (row) => row.org_name,
      },
      {
        title: translate('Abbreviation'),
        render: ({ row }) => renderFieldOrDash(row.org_abbreviation),
        export: (row) => row.org_abbreviation || '',
      },
      {
        title: translate('Code'),
        render: ({ row }) => renderFieldOrDash(row.code),
        export: (row) => row.code || '',
      },
      {
        title: translate('Country'),
        render: ({ row }) => countryCell(row.country),
        export: (row) => row.country || '',
      },
      {
        title: translate('Projects'),
        render: ({ row }) => <>{row.projects_count}</>,
        export: (row) => row.projects_count,
      },
      {
        title: translate('Resources'),
        render: ({ row }) => <>{row.resources_count}</>,
        export: (row) => row.resources_count,
      },
      {
        title: translate('Estimated cost'),
        render: ({ row }) => <>{defaultCurrency(row.estimated_cost)}</>,
        export: (row) => row.estimated_cost,
      },
    ],
    [],
  );

  return (
    <Table<AffiliationRow>
      {...tableProps}
      columns={columns}
      title={translate('Affiliated organizations')}
      verboseName={translate('affiliated organizations')}
      enableExport
    />
  );
};

/** Country rollup. Unaffiliated projects carry no country, so these totals
 * cover the affiliated rows only. */
export const AffiliationCountryTable: FC<{ rows: AffiliationCountryRow[] }> = ({
  rows,
}) => {
  const tableProps = useTable<AffiliationCountryRow>({
    table: 'AffiliationCountryTable',
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });

  const columns = useMemo<Column<AffiliationCountryRow>[]>(
    () => [
      {
        title: translate('Country'),
        render: ({ row }) => hero(countryCell(row.country)),
        export: (row) => row.country || '',
      },
      {
        title: translate('Organizations'),
        render: ({ row }) => <>{row.organizations}</>,
        export: (row) => row.organizations,
      },
      {
        title: translate('Projects'),
        render: ({ row }) => <>{row.projects_count}</>,
        export: (row) => row.projects_count,
      },
      {
        title: translate('Resources'),
        render: ({ row }) => <>{row.resources_count}</>,
        export: (row) => row.resources_count,
      },
      {
        title: translate('Estimated cost'),
        render: ({ row }) => <>{defaultCurrency(row.estimated_cost)}</>,
        export: (row) => row.estimated_cost,
      },
    ],
    [],
  );

  return (
    <Table<AffiliationCountryRow>
      {...tableProps}
      columns={columns}
      title={translate('By country')}
      verboseName={translate('countries')}
      enableExport
    />
  );
};
