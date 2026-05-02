import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import type { EditCOISettingProps } from './EditCOISettingDialog';

const EditCOISettingDialog = lazyComponent(() =>
  import('./EditCOISettingDialog').then((module) => ({
    default: module.EditCOISettingDialog,
  })),
);

export const EditCOISettingButton = (props: EditCOISettingProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditCOISettingDialog, {
      resolve: props,
      size: 'sm',
    });
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
