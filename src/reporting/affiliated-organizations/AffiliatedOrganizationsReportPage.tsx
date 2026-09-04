import { FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { ReportingTitle } from '../ReportingTitle';

import {
  AffiliationCountryTable,
  AffiliationReportTable,
} from './AffiliationTables';
import { useAffiliationReport } from './useAffiliationReport';

export const AffiliatedOrganizationsReportPage: FC = () => {
  const { data, isLoading, error, refetch } = useAffiliationReport();

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <LoadingErred loadData={refetch} />;
  }
  if (!data?.rows.length) {
    return (
      <NoResult
        title={translate('No affiliated organizations found')}
        message={translate(
          'No organization has been registered in the affiliation registry yet.',
        )}
        noAction
      />
    );
  }

  const { summary } = data;
  return (
    <>
      <ReportingTitle reportKey="projects-by-affiliated-organization" />

      <SummaryWidget
        stats={[
          {
            label: translate('Affiliated organizations'),
            value: summary.organizations,
            footer: translate('{count} with projects', {
              count: summary.withProjects,
            }),
          },
          {
            label: translate('Affiliated projects'),
            value: summary.affiliatedProjects,
          },
          {
            label: translate('Unaffiliated projects'),
            value: summary.unaffiliatedProjects,
          },
          {
            label: translate('Affiliation coverage'),
            value:
              summary.coverage === null
                ? DASH_ESCAPE_CODE
                : `${summary.coverage.toFixed(1)}%`,
          },
          {
            label: translate('Estimated cost'),
            value: defaultCurrency(summary.totalCost),
          },
        ]}
      />

      <AffiliationReportTable rows={data.rows} />

      <div className="mt-5">
        <AffiliationCountryTable rows={data.byCountry} />
      </div>

      <p className="text-gray-500 fs-7 mt-4">
        {translate(
          'Each project is counted against the affiliation it carries today. Reassigning a project restates its earlier periods, and projects that have been removed no longer contribute to any organization.',
        )}
      </p>
    </>
  );
};
