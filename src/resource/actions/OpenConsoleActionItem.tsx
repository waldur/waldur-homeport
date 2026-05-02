import { TerminalIcon } from '@phosphor-icons/react';
import { ReactElement } from 'react';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import { ActionItem } from './ActionItem';
import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface OpenConsoleActionItemProps<T> {
  apiMethod(id: string): Promise<string>;
  resource: T;
  validators?: ActionValidator<T>[];
  staff?: boolean;
}

export const OpenConsoleActionItem: <T extends { uuid?: string }>(
  props: OpenConsoleActionItemProps<T>,
) => ReactElement = ({ resource, apiMethod, validators, staff }) => {
  const { showErrorResponse } = useNotify();
  const validationState = useValidators(validators, resource);
  const callback = async () => {
    try {
      const consoleUrl = await apiMethod(resource.uuid);
      window.open(consoleUrl);
    } catch (e) {
      showErrorResponse(e, translate('Unable to open console.'));
    }
  };
  return (
    <ActionItem
      title={translate('Open console')}
      action={callback}
      staff={staff}
      iconNode={<TerminalIcon weight="bold" />}
      {...validationState}
    />
  );
};
