import { AxiosResponse } from 'axios';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ActionItem } from './ActionItem';

interface PullActionItemProps<T> {
  apiMethod(id: string): Promise<AxiosResponse>;
  resource: T;
}

export const usePull = ({ resource, apiMethod }) => {
  const dispatch = useDispatch();
  const action = async () => {
    try {
      await apiMethod(resource.uuid);
      dispatch(showSuccess(translate('Synchronisation has been scheduled.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to synchronise resource.')),
      );
    }
  };
  return {
    action,
    title: translate('Synchronise'),
  };
};

export const PullActionItem: <T extends { uuid: string; backend_id?: string }>(
  props: PullActionItemProps<T>,
) => ReactElement = (props) => {
  const { action, title } = usePull(props);
  if (!props.resource.backend_id) {
    return null;
  }
  return <ActionItem title={title} action={action} />;
};
