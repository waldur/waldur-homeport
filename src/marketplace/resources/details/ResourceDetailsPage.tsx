import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useQuery } from 'react-query';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOffering, getResource } from '@waldur/marketplace/common/api';
import { useTitle } from '@waldur/navigation/title';

import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
  const {
    params: { resource_uuid, tab },
  } = useCurrentStateAndParams();

  const result = useQuery(
    ['resource-details-page', resource_uuid],
    async ({ signal }) => {
      const resource = await getResource(resource_uuid, { signal });
      let scope;
      if (resource.scope) {
        scope = await get(resource.scope, { signal }).then(
          (response) => response.data,
        );
      }
      const components = await getOffering(resource.offering_uuid, {
        signal,
      }).then((offering) => offering.components);
      return { resource, scope, components };
    },
  );

  useTitle(
    result.data
      ? result.data.resource.category_title
      : translate('Resource details'),
  );

  const router = useRouter();

  if (result.error) {
    router.stateService.go('errorPage.notFound');
    return null;
  }

  if (result.isLoading) {
    return <LoadingSpinner />;
  }

  if (!result.data) {
    return null;
  }

  return (
    <ResourceDetailsView
      {...result.data}
      tab={tab}
      reInitResource={() => result.refetch()}
    />
  );
};
