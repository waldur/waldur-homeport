import { CloudCheckIcon } from '@phosphor-icons/react';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { ActionItem } from './ActionItem';
import { ActionItemType } from './types';

interface SetResourceOkActionProps<T> {
  apiMethod(options: { path: { uuid: string } }): Promise<any>;
  resource: T & { uuid?: string; name?: string };
  refetch?(): void;
}

const useSetOk = ({
  resource,
  apiMethod,
  refetch,
}: SetResourceOkActionProps<any>) => {
  const dispatch = useDispatch();
  const user = useUser();

  if (!user.is_staff) {
    return null;
  }

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Mark as OK'),
        translate(
          'Are you sure you want to mark {name} as OK? This will clear any error messages.',
          { name: resource.name },
        ),
      );
    } catch {
      return;
    }

    try {
      await apiMethod({ path: { uuid: resource.uuid } });
      dispatch(showSuccess(translate('Resource has been marked as OK.')));
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to mark resource as OK.')),
      );
    }
  };

  return { action };
};

export const SetResourceOkAction: <T extends { uuid?: string; name?: string }>(
  props: SetResourceOkActionProps<T>,
) => ReactElement = (props) => {
  const result = useSetOk(props);
  if (!result) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Mark as OK')}
      action={result.action}
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
