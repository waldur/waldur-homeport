import { translate } from '@waldur/i18n';
import { detachVolume } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';

import { isBootable } from './utils';

const validators = [
  isBootable,
  validateRuntimeState('in-use'),
  validateState('OK'),
];

export const DetachAction = ({ resource }) => (
  <AsyncActionItem
    title={translate('Detach')}
    apiMethod={detachVolume}
    resource={resource}
    validators={validators}
  />
);
