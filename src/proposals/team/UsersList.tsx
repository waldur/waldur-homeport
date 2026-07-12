import { FC, ReactNode } from 'react';

import { TeamTableComponent } from '@/customer/team/TeamTableComponent';
import { translate } from '@/i18n';
import { GenericPermission } from '@/permissions/types';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { UserRemoveButton } from './UserRemoveButton';

interface UsersListProps {
  table;
  scope;
  hideRole?: boolean;
  hideExpiration?: boolean;
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
  hideExpiration,
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
      hideExpiration={hideExpiration}
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
