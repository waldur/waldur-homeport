import { rancherNodesConsoleLogRetrieve } from 'waldur-js-client';

import { validateState } from '@/resource/actions/base';
import { OpenConsoleLogActionItem } from '@/resource/actions/OpenConsoleLogActionItem';
import { ActionItemType } from '@/resource/actions/types';

const validators = [validateState('OK')];

export const ConsoleLogAction: ActionItemType = ({ resource }) => (
  <OpenConsoleLogActionItem
    apiMethod={(uuid) =>
      rancherNodesConsoleLogRetrieve({ path: { uuid } }).then((r) => r.data)
    }
    validators={validators}
    resource={resource}
  />
);
