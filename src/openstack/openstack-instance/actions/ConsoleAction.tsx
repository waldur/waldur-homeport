import { openstackInstancesConsoleRetrieve } from 'waldur-js-client';

import { validateOpenStackInstanceConsolePermission } from '@waldur/openstack/utils';
import { validateState } from '@waldur/resource/actions/base';
import { OpenConsoleActionItem } from '@waldur/resource/actions/OpenConsoleActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [
  validateState('OK'),
  validateOpenStackInstanceConsolePermission,
];

export const ConsoleAction: ActionItemType = ({ resource }) => (
  <OpenConsoleActionItem
    apiMethod={(uuid) =>
      openstackInstancesConsoleRetrieve({ path: { uuid } }).then(
        (response) => response.data.url,
      )
    }
    validators={validators}
    resource={resource}
  />
);
