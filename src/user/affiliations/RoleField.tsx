import { Badge } from '@/core/Badge';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { getRoleColor } from '../utils';

import { RolePopover } from './RolePopover';

export const RoleField = ({ row }) =>
  row.role_name ? (
    <Badge variant={getRoleColor(row.role_name)} pill outline>
      <RolePopover roleName={row.role_name} />
    </Badge>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
