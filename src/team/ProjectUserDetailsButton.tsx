import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';

export const ProjectUserDetailsButton = props => {
  const dispatch = useDispatch();
  const callback = React.useCallback(
    () =>
      dispatch(
        openModalDialog('userPopover', {
          resolve: { user_uuid: props.user.uuid },
        }),
      ),
    [dispatch],
  );
  return (
    <ActionButton
      title={translate('Details')}
      action={callback}
      icon="fa fa-eye"
    />
  );
};
