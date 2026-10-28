import classNames from 'classnames';
import { useMemo } from 'react';

import { FormField, FormLabel } from 'waldur-ui';

import { SymbolsGroup } from '@/customer/dashboard/SymbolsGroup';
import { GenericPermission, Role } from '@/permissions/types';

export const UserRoleGroup = ({
  role,
  users,
  altLabel,
  max,
  className,
  onClick,
}: {
  role?: Role;
  users: Partial<
    Pick<
      GenericPermission,
      'user_full_name' | 'user_username' | 'user_email' | 'role_name'
    >
  >[];
  altLabel?: string;
  max?: number;
  className?: string;
  onClick?(): any;
}) => {
  const items = useMemo<
    { full_name: string; username: string; email: string }[]
  >(() => {
    let _items: typeof users = [];
    if (role) {
      _items = users.filter((user) => user.role_name === role.name);
    } else if (Array.isArray(users)) {
      _items = users;
    }
    return _items.map((perm) => ({
      full_name: perm.user_full_name,
      username: perm.user_username,
      email: perm.user_email,
    }));
  }, [users, role]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <FormField className={classNames('flex flex-wrap gap-x-5', className)}>
      <FormLabel className="flex-none mb-0 py-[10px]">
        {altLabel || role?.description || role?.name}:
      </FormLabel>
      <div className="w-full sm:flex-1 sm:min-w-0">
        <SymbolsGroup items={items} max={max || 6} onClick={onClick} />
      </div>
    </FormField>
  );
};
