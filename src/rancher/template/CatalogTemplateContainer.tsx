import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import {
  rancherCatalogsRetrieve,
  rancherClustersRetrieve,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { CatalogTemplatesList } from './CatalogTemplateList';

const loadData = async (clusterUuid: string, catalogUuid: string) => {
  const cluster = await rancherClustersRetrieve({
    path: { uuid: clusterUuid },
  }).then((response) => response.data);
  const catalog = await rancherCatalogsRetrieve({
    path: { uuid: catalogUuid },
  }).then((response) => response.data);
  return { cluster, catalog };
};

export const CatalogTemplateContainer: FunctionComponent = () => {
  useTitle(translate('Application templates'));

  const {
    params: { uuid: projectUuid, catalogUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const state = useQuery({
    queryKey: ['CatalogTemplateContainer', clusterUuid, catalogUuid],
    queryFn: () => loadData(clusterUuid, catalogUuid),
  });

  if (state.isLoading) {
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
