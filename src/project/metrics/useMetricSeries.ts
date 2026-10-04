import { useQuery } from '@tanstack/react-query';
import { marketplaceMetricSeriesRetrieve } from 'waldur-js-client';

export const useMetricSeries = (query: {
  offering_metric_uuid: string;
  project_uuid: string;
  start: string;
  granularity?: 'auto' | 'raw' | 'hour' | 'day';
  group_by?: string;
  aggregate?: 'mean' | 'last' | 'min' | 'max';
}) =>
  useQuery({
    queryKey: ['metric-series', query],
    queryFn: () =>
      marketplaceMetricSeriesRetrieve({ query }).then(
        (response) => response.data,
      ),
  });
