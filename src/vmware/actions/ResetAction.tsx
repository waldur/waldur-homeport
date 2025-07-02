import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { vmwareVirtualMachineReset } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK'), validateRuntimeState('POWERED_ON')];

export const ResetAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Reset')}
    resource={resource}
    validators={validators}
    apiMethod={(id) => vmwareVirtualMachineReset({ path: { uuid: id } })}
    refetch={refetch}
    iconNode={<ArrowsClockwiseIcon weight="bold" />}
  />
);
