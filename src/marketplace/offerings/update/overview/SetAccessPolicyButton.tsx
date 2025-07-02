import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { useOrganizationGroups } from '@waldur/marketplace/common/utils';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { SetAccessPolicyDialogProps } from '../../actions/SetAccessPolicyDialog';
import { isVisible } from '../../actions/utils';

const SetAccessPolicyDialog = lazyComponent(() =>
  import('../../actions/SetAccessPolicyDialog').then((module) => ({
    default: module.SetAccessPolicyDialog,
  })),
);

export const SetAccessPolicyButton = ({
  offering,
  refetch,
}: SetAccessPolicyDialogProps['resolve']) => {
  const {
    data: organizationGroups,
    isLoading,
    isError,
    disabled,
    tooltip,
    refetch: refetchGroups,
  } = useOrganizationGroups();
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(SetAccessPolicyDialog, {
        resolve: {
          organizationGroups,
          loading: isLoading,
          error: isError,
          offering,
          refetch,
          refetchGroups,
        },
      }),
    );
  if (!isVisible(offering.state, user.is_staff)) {
    return null;
  }
  return (
    <EditButton
      onClick={callback}
      size="sm"
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
