import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import equal from 'fast-deep-equal';
import { useState, useEffect, FunctionComponent, useMemo } from 'react';
import { useAsyncFn, useEffectOnce, useNetwork } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useRecursiveTimeout } from '@waldur/core/useRecursiveTimeout';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { getResource } from './api';
import { ResourceDetails } from './ResourceDetails';
import { BaseResource } from './types';
import { formatResourceType } from './utils';

export const ResourceDetailsContainer: FunctionComponent = () => {
  const { params } = useCurrentStateAndParams();
  const router = useRouter();

  const [asyncResult, refreshResource] = useAsyncFn(
    () => getResource(params.resource_type, params.resource_uuid),
    [params],
  );

  useEffectOnce(() => {
    refreshResource();
  });

  const { online } = useNetwork();

  const pullInterval = online ? ENV.defaultPullInterval * 1000 : null;
  useRecursiveTimeout(refreshResource, pullInterval);

  const [resource, setResource] = useState<BaseResource>();

  useEffect(() => {
    if (
      asyncResult.value &&
      (!resource ||
        resource.modified !== asyncResult.value.modified ||
        !equal(resource.quotas, asyncResult.value.quotas))
    ) {
      setResource(asyncResult.value);
    }
  }, [resource, asyncResult.value]);

  const header = useMemo(
    () => (resource?.resource_type ? formatResourceType(resource) : null),
    [resource],
  );

  useTitle(resource ? resource.name : translate('Resource details'), header);

  useEffect(() => {
    if (resource?.marketplace_resource_uuid) {
      router.stateService.go(
        'marketplace-project-resource-details',
        {
          resource_uuid: resource.marketplace_resource_uuid,
          uuid: resource.project_uuid,
        },
        { location: 'replace' },
      );
    }
  }, [resource, router.stateService]);

  useEffect(() => {
    if (!asyncResult.error) {
      return;
    }
    if (!resource) {
      router.stateService.go('errorPage.notFound');
      return;
    }
    if (resource.marketplace_category_uuid) {
      router.stateService.go('marketplace-project-resources', {
        category_uuid: resource.marketplace_category_uuid,
        uuid: resource.project_uuid,
      });
    } else {
      router.stateService.go('project.dashboard', {
        uuid: resource.project_uuid,
      });
    }
  }, [asyncResult.error, resource, router.stateService]);

  return resource ? (
    <ResourceDetails resource={resource} refreshResource={refreshResource} />
  ) : asyncResult.loading ? (
    <LoadingSpinner />
  ) : asyncResult.error ? (
    <>{translate('Unable to load resource.')}</>
  ) : null;
};
