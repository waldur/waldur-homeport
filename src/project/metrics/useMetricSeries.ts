import { useQuery } from '@tanstack/react-query';
import { marketplaceMetricSeriesRetrieve } from 'waldur-js-client';

export const useMetricSeries = (query: {
  offering_metric_uuid: string;
  // One of the two: a project's combined figure or one resource's.
  project_uuid?: string;
  resource_uuid?: string;
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
    // While another span loads, the last one stays in view, as long as it
    // is bucketed alike: daily points read as raw ones would be nonsense.
    placeholderData: (previous, previousQuery) => {
      const last = previousQuery?.queryKey[1] as typeof query | undefined;
      return last?.granularity === query.granularity &&
        last?.group_by === query.group_by
        ? previous
        : undefined;
    },
  });
