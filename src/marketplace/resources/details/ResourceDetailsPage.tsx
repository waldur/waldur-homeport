import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useQuery } from 'react-query';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getProviderOffering,
  getResource,
} from '@waldur/marketplace/common/api';
import { useTitle } from '@waldur/navigation/title';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';

import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
  const {
    state,
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
      const components = await getProviderOffering(resource.offering_uuid, {
        signal,
      }).then((offering) => offering.components);

      const tabSpec =
        tab && scope
          ? NestedResourceTabsConfiguration.get(scope.resource_type)
              .map((conf) => conf.children)
              .flat()
              .find((child) => child.key === tab)
          : null;

      return { resource, scope, components, tabSpec };
    },
  );

  useTitle(
    result.data
      ? result.data.tabSpec
        ? result.data.tabSpec.title
        : result.data.resource.category_title
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
      state={state}
      reInitResource={() => result.refetch()}
    />
  );
};
