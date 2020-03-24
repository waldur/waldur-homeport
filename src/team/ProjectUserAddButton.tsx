import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { isOwnerOrStaff } from '@waldur/workspace/selectors';

export const ProjectUserAddButton = () => {
  const dispatch = useDispatch();
  const enabled = useSelector(isOwnerOrStaff);
  const callback = React.useCallback(
    () => dispatch(openModalDialog('addProjectMember')),
    [],
  );
  return (
    <ActionButton
      title={translate('Add member')}
      action={callback}
      disabled={!enabled}
      icon="fa fa-plus"
    />
  );
};
