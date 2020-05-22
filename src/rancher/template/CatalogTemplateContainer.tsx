import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { getCluster, getCatalog } from '../api';
import { Cluster, Catalog } from '../types';

import { CatalogTemplatesList } from './CatalogTemplateList';

const refreshBreadcrumbs = (cluster: Cluster, catalog: Catalog) => {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  BreadcrumbsService.items = [
    {
      label: translate('Project workspace'),
      state: 'project.details',
    },
    {
      label: translate('Resources'),
      state: 'marketplace-project-resources',
      params: {
        category_uuid: cluster.marketplace_category_uuid,
      },
    },
    {
      label: cluster.name,
      state: 'resources.details',
      params: {
        resource_type: 'Rancher.Cluster',
        uuid: cluster.uuid,
        tab: 'catalogs',
      },
    },
    {
      label: translate('Application catalogues'),
    },
    {
      label: catalog.name,
      state: 'rancher-catalog-details',
      params: {
        clusterUuid: cluster.uuid,
        catalogUuid: catalog.uuid,
      },
    },
  ];
  BreadcrumbsService.activeItem = translate('Application templates');
};

const loadData = async (clusterUuid: string, catalogUuid: string) => {
  const cluster = await getCluster(clusterUuid);
  const catalog = await getCatalog(catalogUuid);
  refreshBreadcrumbs(cluster, catalog);
};

export const CatalogTemplateContainer = () => {
  const {
    params: { uuid: projectUuid, catalogUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const state = useAsync(() => loadData(clusterUuid, catalogUuid), [
    clusterUuid,
    catalogUuid,
  ]);

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <>{translate('Unable to load data.')}</>;
  }

  return (
    <CatalogTemplatesList
      catalogUuid={catalogUuid}
      clusterUuid={clusterUuid}
      projectUuid={projectUuid}
    />
  );
};
