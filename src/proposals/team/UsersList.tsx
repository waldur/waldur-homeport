import { FC, ReactNode } from 'react';

import { TeamTableComponent } from '@waldur/customer/team/TeamTableComponent';
import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { UserRemoveButton } from './UserRemoveButton';

interface UsersListProps {
  table;
  scope;
  hideRole?: boolean;
  readOnly?: boolean;
  tableFooter?;
  cardBordered?: boolean;
  hasActionBar?: boolean;
  fullWidth?: boolean;
  expandableRow?: FC<{ row: GenericPermission }> | (({ row }) => ReactNode);
}

export const UsersList: FC<UsersListProps> = ({
  table,
  scope,
  hideRole,
  readOnly,
  tableFooter,
  cardBordered,
  hasActionBar,
  fullWidth,
  expandableRow,
}) => {
  return (
    <TeamTableComponent<GenericPermission>
      {...table}
      hideRole={hideRole}
      userFieldPrefix="user_"
      title={translate('Users')}
      verboseName={translate('users')}
      cardBordered={cardBordered}
      hasActionBar={hasActionBar}
      fullWidth={fullWidth}
      minHeight="auto"
      rowActions={
        readOnly
          ? null
          : ({ row }) => (
              <ActionsDropdownComponent>
                <UserRemoveButton
                  permission={row}
                  refetch={table.fetch}
                  scope={scope}
                />
              </ActionsDropdownComponent>
            )
      }
      footer={tableFooter}
      expandableRow={expandableRow}
    />
  );
};
