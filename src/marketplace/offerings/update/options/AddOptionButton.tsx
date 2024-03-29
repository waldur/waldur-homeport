import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { OPTION_FORM_ID } from './constants';

const AddOptionDialog = lazyComponent(
  () => import('./AddOptionDialog'),
  'AddOptionDialog',
);

export const AddOptionButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AddOptionDialog, {
        resolve: { offering, refetch },
        formId: OPTION_FORM_ID,
      }),
    );
  };
  return (
    <ActionButton
      icon="fa fa-plus"
      title={translate('Add option')}
      action={callback}
    />
  );
};
