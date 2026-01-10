import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { useOrganizationGroups } from '@waldur/marketplace/common/utils';
import { openModalDialog } from '@waldur/modal/actions';

const SetAccessPolicyDialog = lazyComponent(() =>
  import('@waldur/marketplace/offerings/actions/SetAccessPolicyDialog').then(
    (module) => ({
      default: module.SetAccessPolicyDialog,
    }),
  ),
);

export const UpdateCustomerOrganizationsGroupsButton = ({
  customer,
  refetch,
}) => {
  const {
    data: organizationGroups,
    isLoading,
    isError,
    disabled,
    tooltip,
    refetch: refetchGroups,
  } = useOrganizationGroups();
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(SetAccessPolicyDialog, {
        resolve: {
          organizationGroups,
          loading: isLoading,
          error: isError,
          customer,
          refetch,
          refetchGroups,
        },
      }),
    );
  return (
    <CompactEditButton
      onClick={callback}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
