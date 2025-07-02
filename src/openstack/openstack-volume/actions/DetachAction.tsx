import { PlugsIcon } from '@phosphor-icons/react';
import { openstackVolumesDetach } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
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
    apiMethod={(uuid) => openstackVolumesDetach({ path: { uuid } })}
    resource={resource}
    validators={validators}
    refetch={refetch}
    important
    iconNode={<PlugsIcon weight="bold" />}
  />
);
