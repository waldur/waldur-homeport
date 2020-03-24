import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';

export const ProjectUserDeleteButton = props => {
  const dispatch = useDispatch();
  const callback = React.useCallback(
    () =>
      dispatch(
        showSuccess(
          translate('User {user} has been deleted from project.', {
            user: props.user.username,
          }),
        ),
      ),
    [dispatch, props.user],
  );
  return (
    <ActionButton
      title={translate('Remove')}
      action={callback}
      icon="fa fa-trash"
    />
  );
};
