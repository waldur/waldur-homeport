import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
  const { openDialog } = useModal();
  const callback = () => {
    if (props.name === 'end_date') {
      openDialog(EditEndDateDialog, { resolve: props, size: 'lg' });
    } else {
      openDialog(EditFieldDialog, {
        resolve: props,
        size:
          props.name === 'staff_notes' || props.name === 'description'
            ? 'lg'
            : 'sm',
      });
    }
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
      variant="secondary"
    />
  );
};
