import { Badge } from 'react-bootstrap';

import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { RolePopover } from './RolePopover';

export const RoleField = ({ row }) =>
  row.role_name ? (
    <Badge bg="success" text="success" className="bg-opacity-10">
      <RolePopover roleName={row.role_name} />
    </Badge>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
