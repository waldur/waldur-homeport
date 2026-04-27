import { openstackInstancesConsoleRetrieve } from 'waldur-js-client';

import { validateOpenStackInstanceConsolePermission } from '@/openstack/utils';
import { validateState } from '@/resource/actions/base';
import { OpenConsoleActionItem } from '@/resource/actions/OpenConsoleActionItem';
import { ActionItemType } from '@/resource/actions/types';

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
