import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';

import { showHookUpdateDialog } from './actions';

export const HookCreateButton: FunctionComponent = () => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Add notification')}
      action={() => dispatch(showHookUpdateDialog())}
      iconNode={<PlusCircle />}
      variant="primary"
    />
  );
};
