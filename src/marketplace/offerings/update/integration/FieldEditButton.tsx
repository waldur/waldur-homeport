import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { openModalDialog } from '@/modal/actions';

import { EditOfferingProps } from './types';

const EditFieldDialog = lazyComponent(() =>
  import('./EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

export const FieldEditButton = (props: EditOfferingProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: props,
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
