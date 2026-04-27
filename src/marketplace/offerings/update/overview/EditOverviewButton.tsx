import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { openModalDialog } from '@/modal/actions';

import { OVERVIEW_FORM_ID } from './constants';
import { EditOfferingProps } from './types';

const EditOverviewDialog = lazyComponent(() =>
  import('./EditOverviewDialog').then((module) => ({
    default: module.EditOverviewDialog,
  })),
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
  return (
    <CompactEditButton
      onClick={callback}
      disabled={props.disabled}
      variant="secondary"
    />
  );
};
