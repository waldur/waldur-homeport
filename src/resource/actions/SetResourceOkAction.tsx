import { CloudCheckIcon } from '@phosphor-icons/react';
import { ReactElement } from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

import { ActionItem } from './ActionItem';
import { ActionItemType } from './types';

interface SetResourceOkActionProps<T> {
  apiMethod(options: { path: { uuid: string } }): Promise<any>;
  resource: T & { uuid?: string; name?: string };
  refetch?(): void;
}

export const SetResourceOkAction: <T extends { uuid?: string; name?: string }>(
  props: SetResourceOkActionProps<T>,
) => ReactElement = ({ resource, apiMethod, refetch }) => {
  const user = useUser();

  const mutation = useManagedMutation<any, any, void>({
    mutationFn: () => apiMethod({ path: { uuid: resource.uuid } }),
    successMessage: translate('Resource has been marked as OK.'),
    errorMessage: translate('Unable to mark resource as OK.'),
    refetch,
    confirmation: {
      title: translate('Mark as OK'),
      body: translate(
        'Are you sure you want to mark {name} as OK? This will clear any error messages.',
        { name: resource.name },
      ),
    },
  });

  if (!user.is_staff) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Mark as OK')}
      action={() => mutation.mutate()}
      disabled={mutation.isPending}
      staff
      iconNode={<CloudCheckIcon weight="bold" />}
      iconColor="success"
    />
  );
};

export function createSetOkAction(
  apiMethod: (options: { path: { uuid: string } }) => Promise<any>,
): ActionItemType {
  return ({ resource, refetch }) => (
    <SetResourceOkAction
      apiMethod={apiMethod}
      resource={resource}
      refetch={refetch}
    />
  );
}
