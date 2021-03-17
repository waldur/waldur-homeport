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

export const PullActionItem: <T extends { uuid: string; backend_id?: string }>(
  props: PullActionItemProps<T>,
) => ReactElement = ({ resource, apiMethod }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await apiMethod(resource.uuid);
      dispatch(showSuccess(translate('Synchronization has been scheduled.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to synchronize resource.')),
      );
    }
  };
  if (!resource.backend_id) {
    return null;
  }
  return <ActionItem title={translate('Synchronise')} action={callback} />;
};
