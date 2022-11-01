import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getResource } from '@waldur/marketplace/common/api';
import { useTitle } from '@waldur/navigation/title';

import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
  const {
    params: { resource_uuid },
  } = useCurrentStateAndParams();

  const [state, reInitResource] = useAsyncFn(
    () => getResource(resource_uuid),
    [resource_uuid],
  );

  useEffectOnce(() => {
    reInitResource();
  });

  const resource = state.value;

  useTitle(resource ? resource.category_title : translate('Resource details'));

  const router = useRouter();

  if (state.error) {
    router.stateService.go('errorPage.notFound');
    return null;
  }

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (!resource) {
    return null;
  }

  return <ResourceDetailsView resource={resource} />;
};
