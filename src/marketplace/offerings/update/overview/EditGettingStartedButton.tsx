import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { GETTING_STARTED_FORM_ID } from './constants';

const EditGettingStartedDialog = lazyComponent(
  () => import('./EditGettingStartedDialog'),
  'EditGettingStartedDialog',
);

export const EditGettingStartedButton: FC<{ offering; refetch }> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditGettingStartedDialog, {
        resolve: props,
        formId: GETTING_STARTED_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return <EditButton onClick={callback} size="sm" />;
};
