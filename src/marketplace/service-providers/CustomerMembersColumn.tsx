import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { translate } from '@waldur/i18n';

export const CustomerMembersColumn = ({ row }) =>
  row.users_count === 0 ? (
    <>{translate('No active members')}</>
  ) : (
    <SymbolsGroup items={row.users} />
  );
