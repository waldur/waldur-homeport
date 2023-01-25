import { validateState } from '@waldur/resource/actions/base';
import { OpenConsoleActionItem } from '@waldur/resource/actions/OpenConsoleActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { getVirtualMachineConsoleUrl } from '../api';

const validators = [validateState('OK')];

export const ConsoleAction: ActionItemType = ({ resource }) => (
  <OpenConsoleActionItem
    apiMethod={getVirtualMachineConsoleUrl}
    validators={validators}
    resource={resource}
  />
);
