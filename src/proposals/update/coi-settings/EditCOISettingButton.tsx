import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';

import type { EditCOISettingProps } from './EditCOISettingDialog';

const EditCOISettingDialog = lazyComponent(() =>
  import('./EditCOISettingDialog').then((module) => ({
    default: module.EditCOISettingDialog,
  })),
);

export const EditCOISettingButton = (props: EditCOISettingProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditCOISettingDialog, {
        resolve: props,
        size: 'sm',
      }),
    );
  };
  return <CompactEditButton onClick={callback} btnIcon />;
};
