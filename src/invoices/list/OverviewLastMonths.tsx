import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { invoicesList } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useCustomer } from '@/workspace/hooks';

import { MonthOverview } from './MonthOverview';

export const OverviewLastMonths: FunctionComponent = () => {
  const customer = useCustomer();
  const {
    isLoading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['OverviewLastMonths', customer?.uuid],
    queryFn: () =>
      invoicesList({
        query: {
          page: 1,
          page_size: 2,
          customer: customer.url,
          field: [
            'uuid',
            'items',
            'month',
            'year',
            'invoice_date',
            'state',
            'price',
            'total',
            'tax',
          ],
        },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
  });

  const lastMonthTotalCompare = useMemo(() => {
    if (!value?.length) return 0;
    const current = parseFloat(value[0].total) || 0;
    if (value.length === 1) return current > 0 ? 1 : 0;
    const previous = parseFloat(value[1].total) || 0;
    return Math.sign(current - previous) as -1 | 0 | 1;
  }, [value]);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load data')}</>;
  }
  if (!value?.length) {
    return null;
  }

  return (
    <Row className="mb-5">
      {value[0] && (
        <Col sm={12} md={6} className="mb-sm-5 mb-md-0">
          <MonthOverview
            invoice={value[0]}
            customer={customer}
            costTrend={lastMonthTotalCompare}
          />
        </Col>
      )}
      {value[1] && (
        <Col sm={12} md={6}>
          <MonthOverview invoice={value[1]} customer={customer} />
        </Col>
      )}
    </Row>
  );
};
