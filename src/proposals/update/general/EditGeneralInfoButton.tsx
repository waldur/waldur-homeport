import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { EditCallProps } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';

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
  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon />}
      variant="primary"
      className="btn-sm"
    />
  );
};
