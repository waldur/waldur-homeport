import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { OVERVIEW_FORM_ID } from './constants';
import { EditOfferingProps } from './types';

const EditOverviewDialog = lazyComponent(
  () => import('./EditOverviewDialog'),
  'EditOverviewDialog',
);

export const EditOverviewButton: FC<EditOfferingProps> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditOverviewDialog, {
        resolve: props,
        formId: OVERVIEW_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return <EditButton onClick={callback} size="sm" disabled={props.disabled} />;
};
