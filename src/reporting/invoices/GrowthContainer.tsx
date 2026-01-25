import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { invoicesGrowthRetrieve } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { formatGrowthChart } from './utils';

interface AccountingOption {
  value: boolean | undefined;
  label: string;
}

const getAccountingOptions = (): AccountingOption[] => [
  { value: undefined, label: translate('All') },
  { value: true, label: translate('Running accounting') },
  { value: false, label: translate('Not running accounting') },
];

export const GrowthContainer: FC = () => {
  useTitle(translate('Revenue growth'));
  useReportBreadcrumbs({ category: 'financial', currentReport: 'growth' });

  const accountingOptions = getAccountingOptions();
  const [accountingFilter, setAccountingFilter] = useState<AccountingOption>(
    accountingOptions[0],
  );

  const {
    data: chartOptions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['growth-chart', accountingFilter?.value],
    queryFn: async ({ signal }) => {
      const response = await invoicesGrowthRetrieve({
        query: {
          accounting_is_running: accountingFilter?.value,
          accounting_mode: ENV.accountingMode,
        },
        signal,
      });
      return formatGrowthChart(response.data);
    },
  });

  return (
    <Card>
      <Card.Header>
        <Card.Title>{translate('Revenue growth')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Row className="mb-6">
          <Col sm={4} lg={3}>
            <Select
              placeholder={translate('Accounting status')}
              value={accountingFilter}
              onChange={(value: AccountingOption) => setAccountingFilter(value)}
              options={accountingOptions}
              isClearable={false}
              className="metronic-select-container"
              classNamePrefix="metronic-select"
            />
          </Col>
        </Row>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <LoadingErred loadData={refetch} />
        ) : (
          <EChart options={chartOptions} height="400px" />
        )}
      </Card.Body>
    </Card>
  );
};
