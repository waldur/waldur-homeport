import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n/translate';
import { ActionButton } from '@/table/ActionButton';

import { keyCreateDialog } from './actions';

export const KeyCreateButton: FunctionComponent = () => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(() => dispatch(keyCreateDialog()), []);

  return (
    <ActionButton
      title={translate('Add key')}
      action={openFormDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
