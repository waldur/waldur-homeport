import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import equal from 'fast-deep-equal';
import { useState, useEffect, FunctionComponent, useContext } from 'react';
import { useAsyncFn, useEffectOnce, useNetwork } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useRecursiveTimeout } from '@waldur/core/useRecursiveTimeout';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { LayoutContext } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { getResource } from './api';
import { ResourceBreadcrumbsRegistry } from './breadcrumbs/ResourceBreadcrumbsRegistry';
import { ResourceDetails } from './ResourceDetails';
import { BaseResource } from './types';

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

  useBreadcrumbsFn(
    () => (resource ? ResourceBreadcrumbsRegistry.getItems(resource) : []),
    [resource],
  );

  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    if (resource) {
      layoutContext.setSidebarKey(
        `marketplace_category_${resource.marketplace_category_uuid}`,
      );
    }
    return () => {
      layoutContext.setSidebarKey('');
    };
  }, [resource, layoutContext]);

  useTitle(resource ? resource.name : translate('Resource details'));

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
      router.stateService.go('project.details', {
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
