import { useQuery } from '@tanstack/react-query';
import {
  customersCount,
  marketplaceCategoriesCount,
  marketplaceProviderOfferingsCount,
  MarketplaceProviderOfferingsListData,
  projectsCount,
  usersCount,
} from 'waldur-js-client';

import { StatCardGrid } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { ViewAllLink } from '@/core/ViewAllLink';
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

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load statistics data')}
        loadData={refetch}
        className="mb-3"
      />
    );
  }
  if (!data) {
    return null;
  }
  return (
    <StatCardGrid
      stats={[
        {
          label: translate('Organizations'),
          value: data.organizations,
          footer: <ViewAllLink to={{ state: 'organizations' }} />,
        },
        {
          label: translate('Projects'),
          value: data.projects,
          footer: <ViewAllLink to={{ state: 'projects' }} />,
        },
        {
          label: translate('Users'),
          value: data.users,
          footer: <ViewAllLink to={{ state: 'support-users' }} />,
        },
        {
          label: translate('Categories'),
          value: data.categories,
          footer: (
            <ViewAllLink to={{ state: 'admin-marketplace-categories' }} />
          ),
        },
        {
          label: translate('Offerings'),
          value: data.providerOfferings,
          footer: <ViewAllLink to={{ state: 'admin-marketplace-offerings' }} />,
        },
        {
          label: translate('Resources'),
          value: data.resources,
          footer: <ViewAllLink to={{ state: 'all-resources' }} />,
        },
      ]}
    />
  );
};
