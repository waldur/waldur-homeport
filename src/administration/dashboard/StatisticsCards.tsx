import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CallCountCard } from '@waldur/proposals/call-management/CallCountCard';

import * as api from '../api';

export const StatisticsCards = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['statistics'],
    async () => {
      // Order is important
      const promises = [
        api.getCustomersCount(),
        api.getProjectsCount(),
        api.getUsersCount(),
        api.getCategoriesCount(),
        api.getProviderOfferingsCount({
          params: { shared: 'True', state: ['Active', 'Paused'] },
        }),
        api.getResourcesCount({
          params: {
            state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
          },
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
    {
      staleTime: 5 * 60 * 1000,
    },
  );

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
            <CallCountCard
              title={translate('Organizations')}
              value={data.organizations}
              to={{ state: 'admin.customers' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <CallCountCard
              title={translate('Projects')}
              value={data.projects}
              to={{ state: 'admin.projects' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <CallCountCard
              title={translate('Users')}
              value={data.users}
              to={{ state: 'admin-user-users' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <CallCountCard
              title={translate('Categories')}
              value={data.categories}
              to={{ state: 'admin-marketplace-categories' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <CallCountCard
              title={translate('Offerings')}
              value={data.providerOfferings}
              to={{ state: 'admin-marketplace-offerings' }}
            />
          </Col>
          <Col md={6} lg={4}>
            <CallCountCard
              title={translate('Resources')}
              value={data.resources}
              to={{ state: 'marketplace-admin-resources-list' }}
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
