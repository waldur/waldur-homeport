import { Badge } from '@waldur/core/Badge';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { RolePopover } from './RolePopover';

export const RoleField = ({ row }) =>
  row.role_name ? (
    <Badge variant="success" outline pill>
      <RolePopover roleName={row.role_name} />
    </Badge>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
