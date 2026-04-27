import { CloudXIcon } from '@phosphor-icons/react';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { ActionItem } from './ActionItem';
import { ActionItemType } from './types';

interface SetResourceErredActionProps<T> {
  apiMethod(options: { path: { uuid: string } }): Promise<any>;
  resource: T & { uuid?: string; name?: string };
  refetch?(): void;
}

const useSetErred = ({
  resource,
  apiMethod,
  refetch,
}: SetResourceErredActionProps<any>) => {
  const dispatch = useDispatch();
  const user = useUser();

  if (!user.is_staff) {
    return null;
  }

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Mark as erred'),
        translate('Are you sure you want to mark {name} as ERRED?', {
          name: resource.name,
        }),
      );
    } catch {
      return;
    }

    try {
      await apiMethod({ path: { uuid: resource.uuid } });
      dispatch(showSuccess(translate('Resource has been marked as ERRED.')));
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to mark resource as ERRED.')),
      );
    }
  };

  return { action };
};

export const SetResourceErredAction: <
  T extends { uuid?: string; name?: string },
>(
  props: SetResourceErredActionProps<T>,
) => ReactElement = (props) => {
  const result = useSetErred(props);
  if (!result) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Mark as ERRED')}
      action={result.action}
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
