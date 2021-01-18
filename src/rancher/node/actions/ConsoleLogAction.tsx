import { getNodeConsoleUrl } from '@waldur/rancher/api';
import { validateState } from '@waldur/resource/actions/base';
import { OpenConsoleLogActionItem } from '@waldur/resource/actions/OpenConsoleLogActionItem';

const validators = [validateState('OK')];

export const ConsoleLogAction = ({ resource }) => (
  <OpenConsoleLogActionItem
    apiMethod={getNodeConsoleUrl}
    validators={validators}
    resource={resource}
  />
);
