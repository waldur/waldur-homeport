import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { FieldEditButtonProps } from './FieldEditButton.types';

const EditFieldDialog = lazyComponent(() =>
  import('./EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

export const FieldEditButton = (props: FieldEditButtonProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditFieldDialog, {
      resolve: props,
    });
  };
  return (
    <CompactEditButton
      onClick={callback}
      disabled={props.disabled}
      variant="secondary"
      tooltip={props.tooltip}
      iconNode={props.iconNode}
    />
  );
};
