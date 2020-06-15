import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { useRecursiveTimeout } from '@waldur/core/useRecursiveTimeout';
import { translate } from '@waldur/i18n';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { Layout } from '@waldur/navigation/Layout';
import { useTitle } from '@waldur/navigation/title';
import { ProjectSidebar } from '@waldur/project/ProjectSidebar';

import { ResourceBreadcrumbsRegistry } from './breadcrumbs/ResourceBreadcrumbsRegistry';
import { ResourceDetails } from './ResourceDetails';
import { ResourcesService } from './ResourcesService';
import { BaseResource } from './types';

export const ResourceDetailsContainer = () => {
  const { params } = useCurrentStateAndParams();
  const router = useRouter();

  const [asyncResult, refreshResource] = useAsyncFn(
    () => ResourcesService.get(params.resource_type, params.uuid),
    [params],
  );

  useEffectOnce(() => {
    refreshResource();
  });

  useRecursiveTimeout(refreshResource, ENV.resourcesTimerInterval * 1000);

  const [resource, setResource] = React.useState<BaseResource>();

  React.useEffect(() => {
    if (
      asyncResult.value &&
      (!resource || resource.modified !== asyncResult.value.modified)
    ) {
      setResource(asyncResult.value);
    }
  }, [resource, asyncResult.value]);

  useBreadcrumbsFn(
    () => (resource ? ResourceBreadcrumbsRegistry.getItems(resource) : []),
    [resource],
  );

  useTitle(resource ? resource.name : translate('Resource details'));

  React.useEffect(() => {
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

  return (
    <Layout sidebar={<ProjectSidebar />} pageClass="white-bg">
      {resource ? (
        <ResourceDetails
          resource={resource}
          refreshResource={refreshResource}
        />
      ) : asyncResult.loading ? (
        <LoadingSpinner />
      ) : asyncResult.error ? (
        <>{translate('Unable to load resource.')}</>
      ) : null}
    </Layout>
  );
};
