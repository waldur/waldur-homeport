import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { EditProjectProps } from '../types';

const EditFieldDialog = lazyComponent(() =>
  import('./EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);
const EditEndDateDialog = lazyComponent(() =>
  import('./EditEndDateDialog').then((module) => ({
    default: module.EditEndDateDialog,
  })),
);

export const FieldEditButton = (props: EditProjectProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      props.name === 'end_date'
        ? openModalDialog(EditEndDateDialog, { resolve: props, size: 'lg' })
        : openModalDialog(EditFieldDialog, { resolve: props, size: 'sm' }),
    );
  };
  return <EditButton onClick={callback} size="sm" />;
};
