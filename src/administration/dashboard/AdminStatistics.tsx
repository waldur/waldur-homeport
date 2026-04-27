import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap';
import { MarketplaceProviderOfferingsListData } from 'waldur-js-client';

import { count } from '@/core/api';
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
        count(`/api/customers/`),
        count(`/api/projects/`),
        count(`/api/users/`),
        count(`/api/marketplace-categories/`),
        count(`/api/marketplace-provider-offerings/`, {
          shared: true,
          state: ['Active', 'Paused'],
        } satisfies MarketplaceProviderOfferingsListData['query']),
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
    <Row>
      {error && (
        <LoadingErred
          message={translate('Unable to load statistics data')}
          loadData={refetch}
          className="mb-4"
        />
      )}
      {data && (
        <>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Organizations')}
              value={data.organizations}
              to={{ state: 'organizations' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Projects')}
              value={data.projects}
              to={{ state: 'projects' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Users')}
              value={data.users}
              to={{ state: 'support-users' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Categories')}
              value={data.categories}
              to={{ state: 'admin-marketplace-categories' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Offerings')}
              value={data.providerOfferings}
              to={{ state: 'admin-marketplace-offerings' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Resources')}
              value={data.resources}
              to={{ state: 'all-resources' }}
            />
          </Col>
        </>
      )}
      {isLoading && (
        <Col md={6} lg={4}>
          <LoadingSpinner />
        </Col>
      )}
    </Row>
  );
};
