import { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import * as api from '../api';

export const StatisticsCards = () => {
  const [{ value, loading, error }, reFetch] = useAsyncFn(async () => {
    // Order is important
    const promises = [
      api.getCustomersCount(),
      api.getProjectsCount(),
      api.getUsersCount(),
      api.getCategoriesCount(),
      api.getProviderOfferingsCount({
        params: { shared: 'True' },
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
  });

  useEffectOnce(() => {
    reFetch();
  });

  const statisticsData = useMemo(() => {
    const counts: Partial<typeof value> = value || {};
    return [
      {
        title: 'Organizations',
        count: counts.organizations,
        viewLinkState: 'admin.customers',
      },
      {
        title: 'Projects',
        count: counts.projects,
        viewLinkState: 'admin.projects',
      },
      { title: 'Users', count: counts.users, viewLinkState: 'admin.users' },
      {
        title: 'Categories',
        count: counts.categories,
        viewLinkState: 'admin.marketplace-categories',
      },
      {
        title: 'Offerings',
        count: counts.providerOfferings,
        viewLinkState: 'admin.marketplace-offerings',
      },
      {
        title: 'Resources',
        count: counts.resources,
        viewLinkState: 'marketplace-admin-resources',
      },
    ];
  }, [value]);

  return (
    <Row>
      {error && (
        <LoadingErred
          message={translate('Unable to load statistics data')}
          loadData={reFetch}
          className="mb-4"
        />
      )}
      {statisticsData.map((item) => (
        <Col key={item.title} md={6} lg={4}>
          <Card className="mb-6">
            <Card.Body>
              <div className="buttons text-end">
                <Link state={item.viewLinkState} className="btn btn-light">
                  {translate('View all')}
                </Link>
              </div>
              <div className="mb-4">
                {loading ? (
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
