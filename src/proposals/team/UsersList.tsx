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
  /** Extra items rendered in each row's actions dropdown before Remove. */
  extraRowActions?: FC<{ row: GenericPermission }>;
  /** Inline hint next to the role badge, e.g. a "Chair" marker. */
  roleSuffix?: (row: GenericPermission) => ReactNode;
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
  extraRowActions: ExtraRowActions,
  roleSuffix,
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
      roleSuffix={roleSuffix}
      rowActions={
        readOnly
          ? null
          : ({ row }) => (
              <ActionsDropdownComponent>
                {ExtraRowActions ? <ExtraRowActions row={row} /> : null}
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
