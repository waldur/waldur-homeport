import { UsersIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const SetAccessPolicyDialog = lazyComponent(() =>
  import('../../actions/SetAccessPolicyDialog').then((module) => ({
    default: module.SetAccessPolicyDialog,
  })),
);

export const UpdateAccessPoliciesAction = ({ plan, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () =>
      dispatch(
        openModalDialog(SetAccessPolicyDialog, {
          resolve: {
            plan,
            refetch,
          },
        }),
      ),
    [dispatch],
  );

  return (
    <ActionItem
      title={translate('Update access policies')}
      iconNode={<UsersIcon weight="bold" />}
      action={callback}
    />
  );
};
