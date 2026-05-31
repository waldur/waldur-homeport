import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';
import { callLockedTooltip } from '@/proposals/workflow/constants';

import type { EditCOISettingProps } from './EditCOISettingDialog';

const EditCOISettingDialog = lazyComponent(() =>
  import('./EditCOISettingDialog').then((module) => ({
    default: module.EditCOISettingDialog,
  })),
);

interface EditCOISettingButtonProps extends EditCOISettingProps {
  disabled?: boolean;
}

export const EditCOISettingButton = ({
  disabled,
  ...props
}: EditCOISettingButtonProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditCOISettingDialog, {
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
