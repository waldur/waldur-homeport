import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { setCurrentResource } from '@waldur/workspace/actions';

import { fetchData } from './fetchData';
import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
  const { state, params } = useCurrentStateAndParams();
  const dispatch = useDispatch();

  const { data, refetch, isLoading } = useQuery(
    ['resource-details-page', params['resource_uuid']],
    () => fetchData(state, params),
  );

  useTitle(data?.resource.category_title);

  usePermissionView(() => {
    if (data?.resource) {
      switch (data.resource.state) {
        case 'Terminated':
          return {
            permission: 'limited',
            banner: {
              title: translate('Resource is TERMINATED'),
              message: '',
            },
          };
      }
    }
    return null;
  }, [data]);

  useEffect(() => {
    dispatch(setCurrentResource(data?.resource));
    return () => {
      dispatch(setCurrentResource(undefined));
    };
  }, [data?.resource, dispatch]);

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ResourceDetailsView
      {...data}
      refetch={refetch}
      isLoading={isLoading}
      state={state}
    />
  );
};
