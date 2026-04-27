import { PauseCircleIcon } from '@phosphor-icons/react';
import { vmwareVirtualMachineSuspend } from 'waldur-js-client';

import { translate } from '@/i18n';
import { AsyncActionItem } from '@/resource/actions/AsyncActionItem';
import { validateRuntimeState, validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';

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
