import { openstackInstancesConsoleLogRetrieve } from 'waldur-js-client';

import { validateOpenStackInstanceConsolePermission } from '@/openstack/utils';
import { validateState } from '@/resource/actions/base';
import { OpenConsoleLogActionItem } from '@/resource/actions/OpenConsoleLogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const validators = [
  validateState('OK'),
  validateOpenStackInstanceConsolePermission,
];

export const ConsoleLogAction: ActionItemType = ({ resource }) => (
  <OpenConsoleLogActionItem
    apiMethod={(uuid) =>
      openstackInstancesConsoleLogRetrieve({ path: { uuid } }).then(
        (response) => response.data,
      )
    }
    validators={validators}
    resource={resource}
  />
);
