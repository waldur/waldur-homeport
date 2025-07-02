import { PauseCircleIcon } from '@phosphor-icons/react';
import { vmwareVirtualMachineSuspend } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK'), validateRuntimeState('POWERED_ON')];

export const SuspendAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Suspend')}
    resource={resource}
    validators={validators}
    apiMethod={(id) => vmwareVirtualMachineSuspend({ path: { uuid: id } })}
    refetch={refetch}
    iconNode={<PauseCircleIcon weight="bold" />}
  />
);
