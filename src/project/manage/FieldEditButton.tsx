import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { translate } from '@waldur/i18n';
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
        : openModalDialog(EditFieldDialog, {
            resolve: props,
            size:
              props.name === 'staff_notes' || props.name === 'description'
                ? 'lg'
                : 'sm',
          }),
    );
  };

  // Disable editing if project is removed
  const isDisabled = props.disabled || props.project.is_removed;
  const tooltip = props.project.is_removed
    ? translate('Action is disabled for removed project')
    : undefined;

  return (
    <CompactEditButton
      onClick={callback}
      disabled={isDisabled}
      tooltip={tooltip}
    />
  );
};
