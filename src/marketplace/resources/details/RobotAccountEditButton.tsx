import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const RobotAccountEditDialog = lazyComponent(
  () => import('./RobotAccountEditDialog'),
  'RobotAccountEditDialog',
);

export const RobotAccountEditButton = (props) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(RobotAccountEditDialog, {
        resolve: { resource: props.row, refetch: props.refetch },
      }),
    );

  return (
    <ActionButton
      title={translate('Edit')}
      action={callback}
      icon="fa fa-edit"
    />
  );
};
