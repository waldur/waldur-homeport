import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';

import { getCluster, getCatalog } from '../api';
import { Cluster, Catalog } from '../types';

import { CatalogTemplatesList } from './CatalogTemplateList';

const getBreadcrumbs = (
  cluster: Cluster,
  catalog: Catalog,
): BreadcrumbItem[] => {
  return [
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
      state: 'resource-details',
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
};

const loadData = async (clusterUuid: string, catalogUuid: string) => {
  const cluster = await getCluster(clusterUuid);
  const catalog = await getCatalog(catalogUuid);
  return { cluster, catalog };
};

export const CatalogTemplateContainer = () => {
  useTitle(translate('Application templates'));

  const {
    params: { uuid: projectUuid, catalogUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const state = useAsync(() => loadData(clusterUuid, catalogUuid), [
    clusterUuid,
    catalogUuid,
  ]);

  useBreadcrumbsFn(
    () =>
      state.value
        ? getBreadcrumbs(state.value.cluster, state.value.catalog)
        : [],
    [state.value],
  );

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
