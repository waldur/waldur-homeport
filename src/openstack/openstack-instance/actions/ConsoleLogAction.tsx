import { getInstanceConsoleLog } from '@waldur/openstack/api';
import { validateState } from '@waldur/resource/actions/base';
import { OpenConsoleLogActionItem } from '@waldur/resource/actions/OpenConsoleLogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK')];

export const ConsoleLogAction: ActionItemType = ({ resource }) => (
  <OpenConsoleLogActionItem
    apiMethod={getInstanceConsoleLog}
    validators={validators}
    resource={resource}
  />
);
