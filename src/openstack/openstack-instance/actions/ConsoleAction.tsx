import { getInstanceConsoleUrl } from '@waldur/openstack/api';
import { validatePermissionsForConsoleAction } from '@waldur/openstack/utils';
import { validateState } from '@waldur/resource/actions/base';
import { OpenConsoleActionItem } from '@waldur/resource/actions/OpenConsoleActionItem';

const validators = [validateState('OK'), validatePermissionsForConsoleAction];

export const ConsoleAction = ({ resource }) => (
  <OpenConsoleActionItem
    apiMethod={getInstanceConsoleUrl}
    validators={validators}
    resource={resource}
  />
);
