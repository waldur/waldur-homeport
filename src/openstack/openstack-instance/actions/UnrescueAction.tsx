import { ArrowUUpLeftIcon } from '@phosphor-icons/react';
import { openstackInstancesUnrescue } from 'waldur-js-client';

import { translate } from '@/i18n';
import { validateOpenStackInstancePowerPermission } from '@/openstack/utils';
import { AsyncActionItem } from '@/resource/actions/AsyncActionItem';
import { validateState, validateRuntimeState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';

const validators = [
  validateState('OK'),
  validateRuntimeState('RESCUE'),
  validateOpenStackInstancePowerPermission,
];

export const UnrescueAction: ActionItemType = ({ resource, ...rest }) => (
  <AsyncActionItem
    title={translate('Unrescue')}
    validators={validators}
    apiMethod={(uuid) => openstackInstancesUnrescue({ path: { uuid } })}
    resource={resource}
    {...rest}
    iconNode={<ArrowUUpLeftIcon weight="bold" />}
  />
);
