import { FunctionComponent } from 'react';
import { rancherHpasDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceDeleteButton } from '@/resource/actions/ResourceDeleteButton';

export const HPADeleteButton: FunctionComponent<any> = (props) => (
  <ResourceDeleteButton
    apiFunction={() => rancherHpasDestroy({ path: { uuid: props.hpa.uuid } })}
    resourceType={translate('horizontal pod autoscaler')}
  />
);
