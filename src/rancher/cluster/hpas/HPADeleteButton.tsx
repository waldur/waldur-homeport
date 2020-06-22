import * as React from 'react';

import { translate } from '@waldur/i18n';
import { deleteHPA } from '@waldur/rancher/api';

import { ResourceDeleteButton } from '../ResourceDeleteButton';

export const HPADeleteButton = (props) => (
  <ResourceDeleteButton
    apiFunction={() => deleteHPA(props.hpa.uuid)}
    resourceType={translate('horizontal pod autoscaler')}
  />
);
