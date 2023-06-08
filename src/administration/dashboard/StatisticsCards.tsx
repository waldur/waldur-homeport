import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

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

  const statisticsData = useMemo(() => {
    const counts: Partial<typeof data> = data || {};
    return [
      {
        title: translate('Organizations'),
        count: counts.organizations,
        viewLinkState: 'admin.customers',
      },
      {
        title: translate('Projects'),
        count: counts.projects,
        viewLinkState: 'admin.projects',
      },
      {
        title: translate('Users'),
        count: counts.users,
        viewLinkState: 'admin.users',
      },
      {
        title: translate('Categories'),
        count: counts.categories,
        viewLinkState: 'admin.marketplace-categories',
      },
      {
        title: translate('Offerings'),
        count: counts.providerOfferings,
        viewLinkState: 'admin.marketplace-offerings',
      },
      {
        title: translate('Resources'),
        count: counts.resources,
        viewLinkState: 'marketplace-admin-resources',
      },
    ];
  }, [data]);

  return (
    <Row>
      {error && (
        <LoadingErred
          message={translate('Unable to load statistics data')}
          loadData={refetch}
          className="mb-4"
        />
      )}
      {statisticsData.map((item) => (
        <Col key={item.title} md={6} lg={4}>
          <Card className="mb-6">
            <Card.Body className="d-flex d-md-block justify-content-between align-items-center">
              <div className="buttons text-end order-2">
                <Link state={item.viewLinkState} className="btn btn-light">
                  {translate('View all')}
                </Link>
              </div>
              <div className="mb-4 order-1">
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <strong className={'d-block display-4 text-success'}>
                    {item.count}
                  </strong>
                )}
                <strong>{item.title}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
