import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { RowEditButton } from '../RowEditButton';

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
  return <RowEditButton onClick={callback} size="sm" />;
};
