import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import type { EditMatchingSettingProps } from './types';

const EditMatchingSettingDialog = lazyComponent(() =>
  import('./EditMatchingSettingDialog').then((module) => ({
    default: module.EditMatchingSettingDialog,
  })),
);

export const EditMatchingSettingButton = (props: EditMatchingSettingProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditMatchingSettingDialog, {
      resolve: props,
      size: 'sm',
    });
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
