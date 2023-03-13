import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { fetchData } from './fetchData';
import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
  const { state, params } = useCurrentStateAndParams();

  const { data, refetch } = useQuery(
    ['resource-details-page', params['resource_uuid']],
    () => fetchData(state, params),
  );

  useTitle(data.resource.category_title);

  usePermissionView(() => {
    if (data.resource) {
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

  return <ResourceDetailsView {...data} refetch={refetch} state={state} />;
};
