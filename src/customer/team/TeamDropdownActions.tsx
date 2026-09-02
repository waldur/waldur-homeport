import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSelector } from 'react-redux';

import { translate } from '@/i18n';
import { InvitationCreateButton } from '@/invitations/actions/create/InvitationCreateButton';
import { GroupInvitationCreateButton } from '@/invitations/actions/GroupInvitationCreateButton';
import { AddDropdownToggle } from '@/table/ActionsDropdown';
import { getTableState } from '@/table/selectors';
import { useCustomer } from '@/workspace/hooks';

import { ServiceAccountCreateButton } from '../service-accounts/ServiceAccountCreateAction';

import { UserAddButton } from './UserAddButton';

interface TeamDropdownActionsProps {
  refetch?(): void;
}

export const TeamDropdownActions = ({ refetch }: TeamDropdownActionsProps) => {
  const customer = useCustomer();
  const tableState = useSelector(
    getTableState('marketplace-customer-service-accounts'),
  );
  const isServiceAccountLimitReached =
    customer.max_service_accounts > 0 &&
    tableState?.pagination?.resultCount >= customer.max_service_accounts;
  return (
    <RadixDropdownMenu.Root modal={false}>
      <RadixDropdownMenu.Trigger asChild>
        <AddDropdownToggle size="lg" />
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align="start"
          sideOffset={2}
          className="dropdown-menu show position-static"
        >
          <InvitationCreateButton
            roleTypes={['customer', 'project']}
            refetch={refetch}
            enableBulkUpload={true}
          />

          <GroupInvitationCreateButton refetch={refetch} />
          <UserAddButton refetch={refetch} />
          {customer.max_service_accounts !== 0 && (
            <ServiceAccountCreateButton
              context="customer"
              scope={customer}
              refetch={refetch}
              disabled={isServiceAccountLimitReached}
              tooltip={
                isServiceAccountLimitReached
                  ? translate(
                      'Maximum number of service accounts has been reached',
                    )
                  : undefined
              }
            />
          )}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
