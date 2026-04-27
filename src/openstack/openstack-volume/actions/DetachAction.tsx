import { PlugsIcon } from '@phosphor-icons/react';
import { openstackVolumesDetach } from 'waldur-js-client';

import { translate } from '@/i18n';
import { AsyncActionItem } from '@/resource/actions/AsyncActionItem';
import { validateRuntimeState, validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';

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
