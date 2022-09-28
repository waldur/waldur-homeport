import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { formatResourceType } from '@waldur/resource/utils';

import { getResource } from '../common/api';

import { RemoteOfferingDetails } from './RemoteOfferingDetails';

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

  const header = useMemo(
    () =>
      resource?.resource_type
        ? formatResourceType(resource)
        : resource?.offering_name,
    [resource],
  );

  useTitle(resource ? resource.name : translate('Resource details'), header);

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

  return <RemoteOfferingDetails resource={resource} />;
};
