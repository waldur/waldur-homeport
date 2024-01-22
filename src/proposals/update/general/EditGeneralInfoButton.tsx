import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { EditCallProps } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';

const EditGeneralInfoDialog = lazyComponent(
  () => import('./EditGeneralInfoDialog'),
  'EditGeneralInfoDialog',
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
      icon="fa fa-pencil"
      variant="primary"
      className="btn-sm"
    />
  );
};
