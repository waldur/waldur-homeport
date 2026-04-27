import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { openModalDialog } from '@/modal/actions';
import { EditCallProps } from '@/proposals/types';

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
