import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';

import { ActionItem } from './ActionItem';
import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface OpenConsoleActionItemProps<T> {
  apiMethod(id: string): Promise<string>;
  resource: T;
  validators?: ActionValidator<T>[];
}

export const OpenConsoleActionItem: <T extends { uuid: string }>(
  props: OpenConsoleActionItemProps<T>,
) => ReactElement = ({ resource, apiMethod, validators }) => {
  const dispatch = useDispatch();
  const validationState = useValidators(validators, resource);
  const callback = async () => {
    try {
      const consoleUrl = await apiMethod(resource.uuid);
      window.open(consoleUrl);
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to open console.')));
    }
  };
  return (
    <ActionItem
      title={translate('Open console')}
      action={callback}
      {...validationState}
    />
  );
};
