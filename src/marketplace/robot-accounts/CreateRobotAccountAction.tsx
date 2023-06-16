import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const CreateRobotAccountDialog = lazyComponent(
  () => import('./CreateRobotAccountDialog'),
  'CreateRobotAccountDialog',
);

export const CreateRobotAccountAction: ActionItemType = ({ resource }) => {
  const dispatch = useDispatch();

  const callback = () =>
    dispatch(
      openModalDialog(CreateRobotAccountDialog, {
        resolve: {
          resource,
        },
      }),
    );

  return (
    <ActionItem title={translate('Create robot account')} action={callback} />
  );
};
