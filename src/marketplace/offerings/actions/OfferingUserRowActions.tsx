import { useSelector } from 'react-redux';
import { OfferingUser } from 'waldur-js-client';

import { OfferingUserDetailsButton } from '@waldur/marketplace/offerings/details/OfferingUserDetailsButton';
import { ProviderOfferingUserDeleteButton } from '@waldur/marketplace/service-providers/ProviderOfferingUserDeleteButton';
import { ProviderOfferingUserUpdateButton } from '@waldur/marketplace/service-providers/ProviderOfferingUserUpdateButton';
import { RestrictOfferingUserButton } from '@waldur/marketplace/service-providers/RestrictOfferingUser';
import { ServiceProvider } from '@waldur/marketplace/types';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

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
  const user = useUser();
  const customer = useSelector(getCustomer);
  const canUpdateRestrictedStatus = customer
    ? hasPermission(user, {
        permission: PermissionEnum.UPDATE_OFFERING_USER_RESTRICTION,
        customerId: customer.uuid,
      })
    : true;

  // In administration context (no provider), check permissions based on offering customer
  const canUpdateOfferingUser = provider
    ? hasPermission(user, {
        permission: PermissionEnum.UPDATE_OFFERING_USER,
        customerId: provider.customer_uuid,
      })
    : hasPermission(user, {
        permission: PermissionEnum.UPDATE_OFFERING_USER,
        customerId: row.customer_uuid, // Use the row's customer_uuid for admin context
      });

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        (props) => (
          <OfferingUserDetailsButton row={props.row} offering={offering} />
        ),
        (props) => (
          <>
            <ProviderOfferingUserUpdateButton
              {...props}
              provider={provider}
              offering={offering}
              updateScope="username"
            />
            {(Boolean(provider) || canUpdateOfferingUser) && (
              <>
                <ProviderOfferingUserUpdateButton
                  {...props}
                  provider={provider}
                  offering={offering}
                  updateScope="comment"
                />
                <ProviderOfferingUserUpdateButton
                  {...props}
                  provider={provider}
                  offering={offering}
                  updateScope="state"
                />
              </>
            )}

            <ProviderOfferingUserDeleteButton
              {...props}
              provider={provider}
              offering={offering}
            />
          </>
        ),

        canUpdateRestrictedStatus ? RestrictOfferingUserButton : null,
      ].filter(Boolean)}
      data-cy="offering-users-list-actions-dropdown-btn"
    />
  );
};
