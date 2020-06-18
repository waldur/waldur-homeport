import * as React from 'react';

import { translate } from '@waldur/i18n';
import { removeApp } from '@waldur/rancher/api';

import { ResourceDeleteButton } from '../ResourceDeleteButton';

export const ApplicationDeleteButton = props => (
  <ResourceDeleteButton
    apiFunction={() =>
      removeApp(props.application.project_uuid, props.application.id)
    }
    resourceType={translate('application')}
  />
);
