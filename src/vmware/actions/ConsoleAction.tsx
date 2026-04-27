import { vmwareVirtualMachineConsoleRetrieve } from 'waldur-js-client';

import { validateState } from '@/resource/actions/base';
import { OpenConsoleActionItem } from '@/resource/actions/OpenConsoleActionItem';
import { ActionItemType } from '@/resource/actions/types';

const validators = [validateState('OK')];

export const ConsoleAction: ActionItemType = ({ resource }) => (
  <OpenConsoleActionItem
    apiMethod={(id) =>
      vmwareVirtualMachineConsoleRetrieve({ path: { uuid: id } }).then(
        (response) => response.data.url,
      )
    }
    validators={validators}
    resource={resource}
  />
);
