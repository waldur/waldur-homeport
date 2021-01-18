import { validatePermissionsForConsoleAction } from '@waldur/openstack/utils';
import { getNodeConsoleUrl } from '@waldur/rancher/api';
import { validateState } from '@waldur/resource/actions/base';
import { OpenConsoleActionItem } from '@waldur/resource/actions/OpenConsoleActionItem';

const validators = [validateState('OK'), validatePermissionsForConsoleAction];

export const ConsoleAction = ({ resource }) => (
  <OpenConsoleActionItem
    apiMethod={getNodeConsoleUrl}
    validators={validators}
    resource={resource}
  />
);
