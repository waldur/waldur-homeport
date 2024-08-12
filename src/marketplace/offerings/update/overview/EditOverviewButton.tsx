import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { RowEditButton } from '../RowEditButton';

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
  return <RowEditButton onClick={callback} size="sm" />;
};
