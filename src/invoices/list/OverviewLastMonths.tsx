import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { invoicesList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getCustomer } from '@/workspace/selectors';

import { MonthOverview } from './MonthOverview';

export const OverviewLastMonths: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const { loading, error, value } = useAsync(() =>
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
  );

  const lastMonthTotalCompare: -1 | 0 | 1 = useMemo(() => {
    if (!value) return 0;
    else if (value.length === 1) {
      return value[0].total > 0 ? 1 : 0;
    } else if (value.length > 1) {
      if (value[0].total > value[1].total) return 1;
      else if (value[0].total === value[1].total) return 0;
      else return -1;
    }
    return 0;
  }, [value]);

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load data')}</>;
  }
  if (!value.length) {
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
