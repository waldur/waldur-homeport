import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { OfferingCostsChart } from './OfferingCostsChart';
import { OfferingCostsSummaryCards } from './OfferingCostsSummaryCards';
import { OfferingCostsTable } from './OfferingCostsTable';
import { useOfferingCosts, useOfferingCostsSummary } from './useOfferingCosts';

export const OfferingCostsPage: FC = () => {
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

  if (data.offerings.length === 0) {
    return (
      <>
        <ReportingTitle reportKey="offering-costs" />
        <NoResult
          title={translate('No cost data found')}
          message={translate(
            'There are no offerings with associated costs to display.',
          )}
          noAction
        />
      </>
    );
  }

  return (
    <>
      <ReportingTitle reportKey="offering-costs" />
      <OfferingCostsSummaryCards summary={summary} />
      <Row className="mb-6">
        <Col xs={12}>
          <OfferingCostsChart data={data.offerings} />
        </Col>
      </Row>
      <OfferingCostsTable data={data.offerings} />
    </>
  );
};
