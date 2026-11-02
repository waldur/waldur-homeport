import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { AccordionCard, PropertyList, PropertyItem } from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { getPubSubMetrics } from './api';

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
        <PropertyList
          variant="compact"
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-5"
        >
          <PropertyList.Section title={translate('Message counts')}>
            <PropertyItem
              label={translate('Messages sent')}
              value={propVal.count(data.messages_sent)}
              valueClass="text-success"
            />
            <PropertyItem
              label={translate('Messages failed')}
              value={propVal.count(data.messages_failed)}
              valueClass={data.messages_failed > 0 ? 'text-danger' : undefined}
            />
            <PropertyItem
              label={translate('Messages retried')}
              value={propVal.count(data.messages_retried)}
              valueClass={
                data.messages_retried > 0 ? 'text-warning' : undefined
              }
            />
            <PropertyItem
              label={translate('Messages skipped')}
              value={propVal.count(data.messages_skipped)}
            />
          </PropertyList.Section>
          <PropertyList.Section title={translate('Additional metrics')}>
            <PropertyItem
              label={translate('Circuit breaker trips')}
              value={propVal.count(data.circuit_breaker_trips)}
              valueClass={
                data.circuit_breaker_trips > 0 ? 'text-warning' : undefined
              }
            />
            <PropertyItem
              label={translate('Rate limiter rejections')}
              value={propVal.count(data.rate_limiter_rejections)}
            />
            <PropertyItem
              label={translate('Average publish time')}
              value={propVal.duration(data.avg_publish_time_ms, {
                unit: 'ms',
              })}
            />
            <PropertyItem
              label={translate('Last publish time')}
              value={propVal.date(data.last_publish_time, {
                epoch: true,
                precision: 'datetime',
              })}
            />
          </PropertyList.Section>
        </PropertyList>
      ) : (
        <p className="text-quaternary mb-0">
          {translate('Failed to load metrics.')}
        </p>
      )}
    </AccordionCard>
  );
};
