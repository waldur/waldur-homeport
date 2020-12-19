import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { removeApp } from '@waldur/rancher/api';

import { ResourceDeleteButton } from '../ResourceDeleteButton';

export const ApplicationDeleteButton: FunctionComponent<any> = (props) => (
  <ResourceDeleteButton
    apiFunction={() => removeApp(props.application.uuid)}
    resourceType={translate('application')}
  />
);
