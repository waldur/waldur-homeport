import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { azureVirtualmachinesRestart } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK'), validateRuntimeState('running')];

export const RestartAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Restart')}
    resource={resource}
    validators={validators}
    apiMethod={(id) => azureVirtualmachinesRestart({ path: { uuid: id } })}
    refetch={refetch}
    iconNode={<ArrowClockwiseIcon weight="bold" />}
  />
);
