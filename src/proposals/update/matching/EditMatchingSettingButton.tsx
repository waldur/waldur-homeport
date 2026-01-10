import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';

import type { EditMatchingSettingProps } from './types';

const EditMatchingSettingDialog = lazyComponent(() =>
  import('./EditMatchingSettingDialog').then((module) => ({
    default: module.EditMatchingSettingDialog,
  })),
);

export const EditMatchingSettingButton = (props: EditMatchingSettingProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditMatchingSettingDialog, {
        resolve: props,
        size: 'sm',
      }),
    );
  };
  return <CompactEditButton onClick={callback} btnIcon />;
};
