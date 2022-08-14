import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { getCluster, getCatalog } from '../api';

import { CatalogTemplatesList } from './CatalogTemplateList';

const loadData = async (clusterUuid: string, catalogUuid: string) => {
  const cluster = await getCluster(clusterUuid);
  const catalog = await getCatalog(catalogUuid);
  return { cluster, catalog };
};

export const CatalogTemplateContainer: FunctionComponent = () => {
  useTitle(translate('Application templates'));

  const {
    params: { uuid: projectUuid, catalogUuid, clusterUuid },
  } = useCurrentStateAndParams();

  const state = useAsync(
    () => loadData(clusterUuid, catalogUuid),
    [clusterUuid, catalogUuid],
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
