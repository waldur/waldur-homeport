import { CaretDownIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';
import { GroupInvitationCreateButton } from '@waldur/invitations/actions/GroupInvitationCreateButton';
import { getTableState } from '@waldur/table/selectors';
import { getCustomer } from '@waldur/workspace/selectors';

import { ServiceAccountCreateButton } from '../service-accounts/ServiceAccountCreateAction';

import { UserAddButton } from './UserAddButton';

interface TeamDropdownActionsProps {
  refetch?(): void;
}

export const TeamDropdownActions = ({ refetch }: TeamDropdownActionsProps) => {
  const customer = useSelector(getCustomer);
  const tableState = useSelector(
    getTableState('marketplace-customer-service-accounts'),
  );
  const isServiceAccountLimitReached =
    customer.max_service_accounts > 0 &&
    tableState?.pagination?.resultCount >= customer.max_service_accounts;
  return (
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle variant="primary" className="no-arrow btn-icon-right">
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>
        {translate('Add')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
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
      </Dropdown.Menu>
    </Dropdown>
  );
};
