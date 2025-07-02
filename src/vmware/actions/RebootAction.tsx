import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { vmwareVirtualMachineRebootGuest } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK'), validateRuntimeState('POWERED_ON')];

export const RebootAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Reboot')}
    resource={resource}
    validators={validators}
    apiMethod={(id) => vmwareVirtualMachineRebootGuest({ path: { uuid: id } })}
    refetch={refetch}
    iconNode={<ArrowClockwiseIcon weight="bold" />}
  />
);
