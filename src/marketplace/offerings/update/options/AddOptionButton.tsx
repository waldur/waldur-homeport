import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { OPTION_FORM_ID } from './constants';

const AddOptionDialog = lazyComponent(() =>
  import('./AddOptionDialog').then((module) => ({
    default: module.AddOptionDialog,
  })),
);

export const AddOptionButton: FunctionComponent<{
  offering;
  refetch;
  type;
}> = ({ offering, refetch, type }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AddOptionDialog, {
        resolve: { offering, refetch, type },
        formId: OPTION_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add option')}
      action={callback}
    />
  );
};
