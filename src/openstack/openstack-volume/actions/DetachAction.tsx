import { translate } from '@waldur/i18n';
import { detachVolume } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

import { isBootable } from './utils';

const validators = [
  isBootable,
  validateRuntimeState('in-use'),
  validateState('OK'),
];

export const DetachAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Detach')}
    apiMethod={detachVolume}
    resource={resource}
    validators={validators}
    refetch={refetch}
  />
);
