import { useSelector } from 'react-redux';

import { ProviderOfferingUserDeleteButton } from '@waldur/marketplace/service-providers/ProviderOfferingUserDeleteButton';
import { ProviderOfferingUserUpdateButton } from '@waldur/marketplace/service-providers/ProviderOfferingUserUpdateButton';
import { RestrictOfferingUserButton } from '@waldur/marketplace/service-providers/RestrictOfferingUser';
import { OfferingUser } from '@waldur/marketplace/service-providers/types';
import { ServiceProvider } from '@waldur/marketplace/types';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

type OfferingUserRowActionsProps = {
  row: OfferingUser;
  fetch: () => void;
  provider?: ServiceProvider;
  offering?: any;
};

export const OfferingUserRowActions: React.FC<OfferingUserRowActionsProps> = ({
  row,
  fetch,
  provider,
  offering,
}) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const canUpdateRestrictedStatus = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING_USER_RESTRICTION,
    customerId: customer.uuid,
  });

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        (props) => (
          <>
            <ProviderOfferingUserUpdateButton
              {...props}
              provider={provider}
              offering={offering}
            />
            <ProviderOfferingUserDeleteButton
              {...props}
              provider={provider}
              offering={offering}
            />
          </>
        ),
        canUpdateRestrictedStatus ? RestrictOfferingUserButton : null,
      ].filter(Boolean)}
      data-cy="public-resources-list-actions-dropdown-btn"
    />
  );
};
