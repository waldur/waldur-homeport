import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';
import { callLockedTooltip } from '@/proposals/utils';

import type { EditMatchingSettingProps } from './types';

const EditMatchingSettingDialog = lazyComponent(() =>
  import('./EditMatchingSettingDialog').then((module) => ({
    default: module.EditMatchingSettingDialog,
  })),
);

interface EditMatchingSettingButtonProps extends EditMatchingSettingProps {
  disabled?: boolean;
}

export const EditMatchingSettingButton = ({
  disabled,
  ...props
}: EditMatchingSettingButtonProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditMatchingSettingDialog, {
      resolve: props,
      size: 'sm',
    });
  };
  return (
    <CompactEditButton
      onClick={callback}
      variant="secondary"
      disabled={disabled}
      tooltip={disabled ? callLockedTooltip() : undefined}
    />
  );
};
