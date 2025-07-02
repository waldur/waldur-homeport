import { StopIcon } from '@phosphor-icons/react';
import { azureVirtualmachinesStop } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK'), validateRuntimeState('running')];

export const StopAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Stop')}
    resource={resource}
    validators={validators}
    apiMethod={(id) => azureVirtualmachinesStop({ path: { uuid: id } })}
    refetch={refetch}
    iconNode={<StopIcon weight="bold" />}
  />
);
