import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';
import { EditCallProps } from '@waldur/proposals/types';

const EditGeneralInfoDialog = lazyComponent(() =>
  import('./EditGeneralInfoDialog').then((module) => ({
    default: module.EditGeneralInfoDialog,
  })),
);

export const EditGeneralInfoButton = (props: EditCallProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditGeneralInfoDialog, {
        resolve: props,
        size: 'lg',
      }),
    );
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
