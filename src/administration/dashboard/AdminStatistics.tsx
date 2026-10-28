import { useQuery } from '@tanstack/react-query';
import {
  customersCount,
  marketplaceCategoriesCount,
  marketplaceProviderOfferingsCount,
  MarketplaceProviderOfferingsListData,
  projectsCount,
  usersCount,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StatisticsCard } from '@/core/StatisticsCard';
import { translate } from '@/i18n';

import * as api from '../api';

export const AdminStatistics = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['statistics'],

    queryFn: async () => {
      // Order is important
      const promises = [
        customersCount().then(fetchResultCount),
        projectsCount().then(fetchResultCount),
        usersCount().then(fetchResultCount),
        marketplaceCategoriesCount().then(fetchResultCount),
        marketplaceProviderOfferingsCount({
          query: {
            shared: true,
            state: ['Active', 'Paused'],
          } satisfies MarketplaceProviderOfferingsListData['query'],
        }).then(fetchResultCount),
        api.getResourcesCount({
          state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
        }),
      ];

      const [
        organizations,
        projects,
        users,
        categories,
        providerOfferings,
        resources,
      ] = await Promise.all(promises);
      return {
        organizations,
        projects,
        users,
        categories,
        providerOfferings,
        resources,
      };
    },

    staleTime: STALE_TIME,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">
      {error && (
        <LoadingErred
          message={translate('Unable to load statistics data')}
          loadData={refetch}
          className="mb-3 col-span-full"
        />
      )}
      {data && (
        <>
          <div>
            <StatisticsCard
              title={translate('Organizations')}
              value={data.organizations}
              to={{ state: 'organizations' }}
            />
          </div>
          <div>
            <StatisticsCard
              title={translate('Projects')}
              value={data.projects}
              to={{ state: 'projects' }}
            />
          </div>
          <div>
            <StatisticsCard
              title={translate('Users')}
              value={data.users}
              to={{ state: 'support-users' }}
            />
          </div>
          <div>
            <StatisticsCard
              title={translate('Categories')}
              value={data.categories}
              to={{ state: 'admin-marketplace-categories' }}
            />
          </div>
          <div>
            <StatisticsCard
              title={translate('Offerings')}
              value={data.providerOfferings}
              to={{ state: 'admin-marketplace-offerings' }}
            />
          </div>
          <div>
            <StatisticsCard
              title={translate('Resources')}
              value={data.resources}
              to={{ state: 'all-resources' }}
            />
          </div>
        </>
      )}
      {isLoading && (
        <div>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};
