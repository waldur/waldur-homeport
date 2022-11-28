import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourceDetailsPage: FunctionComponent<{ result }> = ({
  result,
}) => {
  const { state } = useCurrentStateAndParams();

  useTitle(result.resource.category_title);

  usePermissionView(() => {
    if (result.resource) {
      switch (result.resource.state) {
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
  }, [result]);

  return <ResourceDetailsView {...result} state={state} />;
};
