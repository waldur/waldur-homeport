import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ADD_COMPONENT_FORM_ID } from './constants';

const AddComponentDialog = lazyComponent(
  () => import('./AddComponentDialog'),
  'AddComponentDialog',
);

export const AddComponentButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AddComponentDialog, {
        resolve: { offering, refetch },
        formId: ADD_COMPONENT_FORM_ID,
      }),
    );
  };
  return (
    <ActionButton
      iconNode={<PlusCircle />}
      title={translate('Add component')}
      action={callback}
    />
  );
};
