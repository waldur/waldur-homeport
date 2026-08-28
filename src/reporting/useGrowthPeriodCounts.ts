import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import {
  marketplacePublicOfferingsCount,
  marketplaceResourcesCount,
  marketplaceServiceProvidersCount,
  projectsCount as fetchProjectsCount,
  usersCount,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { STALE_TIME } from '@/core/constants';

/**
 * How much each headline figure grew inside the selected period.
 *
 * Deliberately a separate query from `useGrowthStatistics`: moving the period
 * toggle then refetches these five counts alone instead of the whole trend
 * payload, which does not depend on the period at all.
 *
 * Each count repeats its tile's own filters and only adds the date bound, so a
 * badge is always a subset of the figure above it. That makes the users delta
 * `is_active`-bound like the "Active users" tile — while the chart below is
 * drawn from `user_registration_trend`, which counts every account ever
 * registered. A badge smaller than the chart's rise over the same months is
 * that difference, not a bug.
 */
export const useGrowthPeriodCounts = (months: number) =>
  useQuery({
    queryKey: ['growthPeriodCounts', months],
    enabled: months > 0,
    queryFn: async ({ signal }) => {
      // Start of the earliest month the period covers, so a tile's delta spans
      // exactly the buckets the trend charts draw rather than a rolling window
      // whose head sits mid-month and disagrees with the chart beside it.
      const created = DateTime.now()
        .minus({ months: months - 1 })
        .startOf('month')
        .toISODate()!;
      const [offerings, projects, providers, resources, users] =
        await Promise.all([
          marketplacePublicOfferingsCount({ query: { created }, signal }).then(
            fetchResultCount,
          ),
          fetchProjectsCount({ query: { created }, signal }).then(
            fetchResultCount,
          ),
          marketplaceServiceProvidersCount({ query: { created }, signal }).then(
            fetchResultCount,
          ),
          marketplaceResourcesCount({
            query: { state: ['OK'], created },
            signal,
          }).then(fetchResultCount),
          // Users have no `created`; their join date is the equivalent bound.
          usersCount({
            query: { is_active: true, date_joined: created },
            signal,
          }).then(fetchResultCount),
        ]);
      // The period travels with the counts so the caption can name the window
      // these numbers were actually fetched for. While the next period loads,
      // `keepPreviousData` holds the previous pair on screen — labelling it
      // with the live toggle instead would caption a 6-month count "12 months".
      return { months, offerings, projects, providers, resources, users };
    },
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
