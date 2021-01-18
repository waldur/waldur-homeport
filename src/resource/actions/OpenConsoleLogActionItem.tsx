import { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';

import { ActionItem } from './ActionItem';
import { ActionValidator } from './types';
import { useValidators } from './useValidators';

interface OpenConsoleLogActionItemProps<T> {
  apiMethod(id: string): Promise<string>;
  resource: T;
  validators?: ActionValidator<T>[];
}

export const OpenConsoleLogActionItem: <T extends { uuid: string }>(
  props: OpenConsoleLogActionItemProps<T>,
) => ReactElement = ({ resource, apiMethod, validators }) => {
  const dispatch = useDispatch();
  const validationState = useValidators(validators, resource);
  const callback = async () => {
    try {
      const consoleLog = await apiMethod(resource.uuid);
      const win = window.open();
      if (win == null) {
        alert(translate('Unable to open console log'));
        return;
      }
      const doc = win.document;
      doc.open();
      doc.write(`<pre>${consoleLog}</pre>`);
      doc.close();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to show console log.')));
    }
  };
  return (
    <ActionItem
      title={translate('Show console log')}
      action={callback}
      {...validationState}
    />
  );
};
