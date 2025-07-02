import { PlayIcon } from '@phosphor-icons/react';
import { azureVirtualmachinesStart } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK'), validateRuntimeState('stopped')];

export const StartAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Start')}
    resource={resource}
    validators={validators}
    apiMethod={(id) => azureVirtualmachinesStart({ path: { uuid: id } })}
    refetch={refetch}
    iconNode={<PlayIcon weight="bold" />}
  />
);
