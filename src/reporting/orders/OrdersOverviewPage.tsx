import { FC, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { OrdersFilter } from './OrdersFilter';
import { OrdersStateChart } from './OrdersStateChart';
import { OrdersSummaryCards } from './OrdersSummaryCards';
import { OrdersTrendChart } from './OrdersTrendChart';
import { OrdersTypeChart } from './OrdersTypeChart';
import { useOrdersStats } from './useOrdersStats';

export const OrdersOverviewPage: FC = () => {
  useTitle(translate('Orders overview'));
  useReportBreadcrumbs({ category: 'financial', currentReport: 'orders' });

  const [days, setDays] = useState(30);

  const { isLoading, error, refetch, data } = useOrdersStats({ days });

  return (
    <>
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>{translate('Filters')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <OrdersFilter days={days} onDaysChange={setDays} />
        </Card.Body>
      </Card>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : data ? (
        <>
          <OrdersSummaryCards stats={data.summary} />

          <Row className="g-4 mb-6">
            <Col xs={12} lg={8}>
              <OrdersTrendChart dailyStats={data.daily} />
            </Col>
            <Col xs={12} lg={4}>
              <OrdersStateChart stateStats={data.by_state} />
            </Col>
          </Row>

          <Row className="g-4">
            <Col xs={12} lg={6}>
              <OrdersTypeChart typeStats={data.by_type} />
            </Col>
          </Row>
        </>
      ) : null}
    </>
  );
};
