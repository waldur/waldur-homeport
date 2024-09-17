import { ArrowsClockwise } from '@phosphor-icons/react';
import { AxiosResponse } from 'axios';
import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ActionItem, ActionItemProps } from './ActionItem';
import { validateState } from './base';
import { ActionContext } from './types';
import { useValidators } from './useValidators';

interface PullActionItemProps<T> {
  apiMethod(id: string): Promise<AxiosResponse>;
  resource: T;
  staff?: boolean;
  iconClass?: string;
  as?;
  refetch?;
}

const hasBackendId = (ctx: ActionContext) =>
  ctx.resource.backend_id
    ? undefined
    : translate('Resource does not have backend ID.');

const validators = [validateState('OK', 'Erred'), hasBackendId];

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
    tooltip,
    disabled,
    important: true,
  } as ActionItemProps;
};

export const PullActionItem: <T extends { uuid: string; backend_id?: string }>(
  props: PullActionItemProps<T>,
) => ReactElement = (props) => {
  const buttonProps = usePull(props);
  return (
    <ActionItem
      {...buttonProps}
      as={props.as}
      staff={props.staff}
      iconNode={<ArrowsClockwise />}
    />
  );
};
