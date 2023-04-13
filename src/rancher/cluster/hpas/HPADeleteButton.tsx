import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { deleteHPA } from '@waldur/rancher/api';
import { ResourceDeleteButton } from '@waldur/resource/actions/ResourceDeleteButton';

export const HPADeleteButton: FunctionComponent<any> = (props) => (
  <ResourceDeleteButton
    apiFunction={() => deleteHPA(props.hpa.uuid)}
    resourceType={translate('horizontal pod autoscaler')}
  />
);
