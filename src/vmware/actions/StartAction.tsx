import { PlayIcon } from '@phosphor-icons/react';
import { vmwareVirtualMachineStart } from 'waldur-js-client';

import { translate } from '@/i18n';
import { AsyncActionItem } from '@/resource/actions/AsyncActionItem';
import { validateRuntimeState, validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';

const validators = [
  validateState('OK'),
  validateRuntimeState('POWERED_OFF', 'SUSPENDED'),
];

export const StartAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Start')}
    resource={resource}
    validators={validators}
    apiMethod={(id) => vmwareVirtualMachineStart({ path: { uuid: id } })}
    refetch={refetch}
    iconNode={<PlayIcon weight="bold" />}
  />
);
