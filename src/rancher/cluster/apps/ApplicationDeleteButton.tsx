import { FunctionComponent } from 'react';
import { rancherAppsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceDeleteButton } from '@/resource/actions/ResourceDeleteButton';

interface ApplicationDeleteButtonProps {
  application: {
    uuid: string;
  };
}

export const ApplicationDeleteButton: FunctionComponent<
  ApplicationDeleteButtonProps
> = ({ application }) => (
  <ResourceDeleteButton
    apiFunction={() => rancherAppsDestroy({ path: { uuid: application.uuid } })}
    resourceType={translate('application')}
  />
);
