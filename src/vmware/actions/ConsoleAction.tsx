import { validateState } from '@waldur/resource/actions/base';
import { OpenConsoleActionItem } from '@waldur/resource/actions/OpenConsoleActionItem';

import { getVirtualMachineConsoleUrl } from '../api';

const validators = [validateState('OK')];

export const ConsoleAction = ({ resource }) => (
  <OpenConsoleActionItem
    apiMethod={getVirtualMachineConsoleUrl}
    validators={validators}
    resource={resource}
  />
);
