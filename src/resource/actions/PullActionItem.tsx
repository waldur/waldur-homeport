import { AxiosResponse } from 'axios';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ActionItem } from './ActionItem';
import { validateState } from './base';
import { useValidators } from './useValidators';

interface PullActionItemProps<T> {
  apiMethod(id: string): Promise<AxiosResponse>;
  resource: T;
  staff?: boolean;
  iconClass?: string;
  as?;
  refetch?;
}

const validators = [validateState('OK', 'Erred')];

const usePull = ({
  resource,
  apiMethod,
  refetch,
}: Pick<PullActionItemProps<any>, 'resource' | 'apiMethod' | 'refetch'>) => {
  const dispatch = useDispatch();
  const action = async () => {
    try {
      await apiMethod(resource.uuid);
      dispatch(showSuccess(translate('Synchronisation has been scheduled.')));
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to synchronise resource.')),
      );
    }
  };
  const { tooltip, disabled } = useValidators(validators, resource);
  return {
    action,
    title: translate('Synchronise'),
    iconClass: 'fa-refresh',
    tooltip,
    disabled,
  };
};

export const PullActionItem: <T extends { uuid: string; backend_id?: string }>(
  props: PullActionItemProps<T>,
) => ReactElement = (props) => {
  const buttonProps = usePull(props);
  if (!props.resource.backend_id) {
    return null;
  }
  return <ActionItem {...buttonProps} as={props.as} staff={props.staff} />;
};
