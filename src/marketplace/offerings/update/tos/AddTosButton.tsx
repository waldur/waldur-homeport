import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { TOS_FORM_ID } from './constants';

const AddTosDialog = lazyComponent(() =>
  import('./AddTosDialog').then((module) => ({
    default: module.AddTosDialog,
  })),
);

export const AddTosButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AddTosDialog, {
        resolve: { offering, refetch },
        formId: TOS_FORM_ID,
      }),
    );
  };

  return (
    <ActionButton
      action={callback}
      title={translate('Add Terms of Service')}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
