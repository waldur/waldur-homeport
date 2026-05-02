import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useOrganizationGroups } from '@/marketplace/common/utils';
import { useModal } from '@/modal/actions';

const SetAccessPolicyDialog = lazyComponent(() =>
  import('@/marketplace/offerings/actions/SetAccessPolicyDialog').then(
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
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(SetAccessPolicyDialog, {
      resolve: {
        organizationGroups,
        loading: isLoading,
        error: isError,
        customer,
        refetch,
        refetchGroups,
      },
    });
  return (
    <CompactEditButton
      onClick={callback}
      disabled={disabled}
      tooltip={tooltip}
      variant="secondary"
    />
  );
};
