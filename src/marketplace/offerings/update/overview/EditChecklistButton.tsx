import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { EditOfferingChecklistProps } from './types';

const EditOfferingChecklistDialog = lazyComponent(() =>
  import('./EditOfferingChecklistDialog').then((module) => ({
    default: module.EditOfferingChecklistDialog,
  })),
);

export const EditChecklistButton: FC<EditOfferingChecklistProps> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditOfferingChecklistDialog, {
        resolve: props,
      }),
    );
  };
  return <CompactEditButton onClick={callback} />;
};
