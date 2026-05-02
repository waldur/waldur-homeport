import { CloudXIcon } from '@phosphor-icons/react';
import { ReactElement } from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

import { ActionItem } from './ActionItem';
import { ActionItemType } from './types';

interface SetResourceErredActionProps<T> {
  apiMethod(options: { path: { uuid: string } }): Promise<any>;
  resource: T & { uuid?: string; name?: string };
  refetch?(): void;
}

export const SetResourceErredAction: <
  T extends { uuid?: string; name?: string },
>(
  props: SetResourceErredActionProps<T>,
) => ReactElement = ({ resource, apiMethod, refetch }) => {
  const user = useUser();

  const mutation = useManagedMutation<any, any, void>({
    mutationFn: () => apiMethod({ path: { uuid: resource.uuid } }),
    successMessage: translate('Resource has been marked as ERRED.'),
    errorMessage: translate('Unable to mark resource as ERRED.'),
    refetch,
    confirmation: {
      title: translate('Mark as erred'),
      body: translate('Are you sure you want to mark {name} as ERRED?', {
        name: resource.name,
      }),
    },
  });

  if (!user.is_staff) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Mark as ERRED')}
      action={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="text-danger"
      staff
      iconNode={<CloudXIcon weight="bold" />}
      iconColor="danger"
    />
  );
};

export function createSetErredAction(
  apiMethod: (options: { path: { uuid: string } }) => Promise<any>,
): ActionItemType {
  return ({ resource, refetch }) => (
    <SetResourceErredAction
      apiMethod={apiMethod}
      resource={resource}
      refetch={refetch}
    />
  );
}
