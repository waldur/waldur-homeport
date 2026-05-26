import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';
import { EditCallProps } from '@/proposals/types';
import { callLockedTooltip } from '@/proposals/utils';

const EditGeneralInfoDialog = lazyComponent(() =>
  import('./EditGeneralInfoDialog').then((module) => ({
    default: module.EditGeneralInfoDialog,
  })),
);

interface EditGeneralInfoButtonProps extends EditCallProps {
  disabled?: boolean;
}

export const EditGeneralInfoButton = ({
  disabled,
  ...props
}: EditGeneralInfoButtonProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditGeneralInfoDialog, {
      resolve: props,
      size: 'lg',
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
