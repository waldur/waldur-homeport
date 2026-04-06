import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';

import { personalAccessTokenCreateDialog } from './actions';

export const PersonalAccessTokenCreateButton: FunctionComponent<{
  refetch?;
}> = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () => dispatch(personalAccessTokenCreateDialog(refetch)),
    [dispatch, refetch],
  );

  return (
    <ActionButton
      title={translate('Create token')}
      action={openFormDialog}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
