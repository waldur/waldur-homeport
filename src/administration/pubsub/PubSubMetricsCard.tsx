import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { AccordionCard } from 'waldur-ui';

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
      className="mb-5"
    >
      {isLoading ? (
        <div className="text-center py-3">
          <LoadingSpinner />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
          <div>
            <h6 className="uppercase text-quaternary mb-2.5">
              {translate('Message counts')}
            </h6>
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                <tr>
                  <td className="text-quaternary">
                    {translate('Messages sent')}
                  </td>
                  <td className="text-end text-success">
                    {formatNumber(data.messages_sent)}
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Messages failed')}
                  </td>
                  <td
                    className={`text-end ${data.messages_failed > 0 ? 'text-danger' : ''}`}
                  >
                    {formatNumber(data.messages_failed)}
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Messages retried')}
                  </td>
                  <td
                    className={`text-end ${data.messages_retried > 0 ? 'text-warning' : ''}`}
                  >
                    {formatNumber(data.messages_retried)}
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Messages skipped')}
                  </td>
                  <td className="text-end">
                    {formatNumber(data.messages_skipped)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h6 className="uppercase text-quaternary mb-2.5">
              {translate('Additional metrics')}
            </h6>
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                <tr>
                  <td className="text-quaternary">
                    {translate('Circuit breaker trips')}
                  </td>
                  <td
                    className={`text-end ${data.circuit_breaker_trips > 0 ? 'text-warning' : ''}`}
                  >
                    {formatNumber(data.circuit_breaker_trips)}
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Rate limiter rejections')}
                  </td>
                  <td className="text-end">
                    {formatNumber(data.rate_limiter_rejections)}
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Average publish time')}
                  </td>
                  <td className="text-end">
                    {formatLatency(data.avg_publish_time_ms)}
                  </td>
                </tr>
                <tr>
                  <td className="text-quaternary">
                    {translate('Last publish time')}
                  </td>
                  <td className="text-end">
                    {formatTimestamp(data.last_publish_time)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-quaternary mb-0">
          {translate('Failed to load metrics.')}
        </p>
      )}
    </AccordionCard>
  );
};
