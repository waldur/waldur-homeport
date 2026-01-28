import { FC } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { OfferingCostsChart } from './OfferingCostsChart';
import { OfferingCostsSummaryCards } from './OfferingCostsSummaryCards';
import { OfferingCostsTable } from './OfferingCostsTable';
import { useOfferingCosts, useOfferingCostsSummary } from './useOfferingCosts';

export const OfferingCostsPage: FC = () => {
  useTitle(translate('Offering costs'));
  useReportBreadcrumbs({
    category: 'financial',
    currentReport: 'offering-costs',
  });

  const { data, isLoading, error, refetch } = useOfferingCosts();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useOfferingCostsSummary();

  if (isLoading || summaryLoading) {
    return <LoadingSpinner />;
  }

  if (error || summaryError) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!data || !summary || summary.offeringCount === 0) {
    return (
      <NoResult
        title={translate('No cost data found')}
        message={translate(
          'There are no offerings with associated costs to display.',
        )}
      />
    );
  }

  return (
    <>
      <OfferingCostsSummaryCards summary={summary} />
      <div className="mb-6">
        <OfferingCostsChart data={data.offerings} />
      </div>
      <OfferingCostsTable data={data.offerings} />
    </>
  );
};
