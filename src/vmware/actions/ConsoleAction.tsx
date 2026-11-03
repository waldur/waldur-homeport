import { vmwareVirtualMachineConsoleRetrieve } from 'waldur-js-client';

import { validateState } from '@/resource/actions/base';
import { OpenConsoleActionItem } from '@/resource/actions/OpenConsoleActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

const validators = [validateState('OK')];

// The API serves the remote console (VMRC) to staff only.
export const ConsoleAction: ActionItemType = ({ resource }) => {
  const user = useUser();
  if (!user?.is_staff) {
    return null;
  }
  return (
    <OpenConsoleActionItem
      apiMethod={(id) =>
        vmwareVirtualMachineConsoleRetrieve({ path: { uuid: id } }).then(
          (response) => response.data.url,
        )
      }
      validators={validators}
      resource={resource}
      staff
    />
  );
};
