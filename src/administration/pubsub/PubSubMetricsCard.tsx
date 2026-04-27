import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col, Row, Table } from 'react-bootstrap';

import { AccordionCard } from '@/core/AccordionCard';
import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { getPubSubMetrics } from './api';
import { formatLatency, formatNumber, formatTimestamp } from './utils';

export const PubSubMetricsCard: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['PubSubMetrics'],
    queryFn: getPubSubMetrics,
    staleTime: FAST_STALE_TIME,
  });

  return (
    <AccordionCard
      id="pubsub-metrics"
      title={translate('Publishing metrics')}
      subtitle={translate('Message statistics')}
      defaultOpen={false}
      className="mb-6"
    >
      {isLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner />
        </div>
      ) : data ? (
        <Row>
          <Col lg={6}>
            <h6 className="text-uppercase text-muted mb-3">
              {translate('Message counts')}
            </h6>
            <Table size="sm" borderless className="mb-0">
              <tbody>
                <tr>
                  <td className="text-muted">{translate('Messages sent')}</td>
                  <td className="fw-semibold text-end text-success">
                    {formatNumber(data.messages_sent)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">{translate('Messages failed')}</td>
                  <td
                    className={`fw-semibold text-end ${data.messages_failed > 0 ? 'text-danger' : ''}`}
                  >
                    {formatNumber(data.messages_failed)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">
                    {translate('Messages retried')}
                  </td>
                  <td
                    className={`fw-semibold text-end ${data.messages_retried > 0 ? 'text-warning' : ''}`}
                  >
                    {formatNumber(data.messages_retried)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">
                    {translate('Messages skipped')}
                  </td>
                  <td className="fw-semibold text-end">
                    {formatNumber(data.messages_skipped)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col lg={6}>
            <h6 className="text-uppercase text-muted mb-3">
              {translate('Additional metrics')}
            </h6>
            <Table size="sm" borderless className="mb-0">
              <tbody>
                <tr>
                  <td className="text-muted">
                    {translate('Circuit breaker trips')}
                  </td>
                  <td
                    className={`fw-semibold text-end ${data.circuit_breaker_trips > 0 ? 'text-warning' : ''}`}
                  >
                    {formatNumber(data.circuit_breaker_trips)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">
                    {translate('Rate limiter rejections')}
                  </td>
                  <td className="fw-semibold text-end">
                    {formatNumber(data.rate_limiter_rejections)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">
                    {translate('Average publish time')}
                  </td>
                  <td className="fw-semibold text-end">
                    {formatLatency(data.avg_publish_time_ms)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">
                    {translate('Last publish time')}
                  </td>
                  <td className="fw-semibold text-end">
                    {formatTimestamp(data.last_publish_time)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      ) : (
        <p className="text-muted mb-0">
          {translate('Failed to load metrics.')}
        </p>
      )}
    </AccordionCard>
  );
};
