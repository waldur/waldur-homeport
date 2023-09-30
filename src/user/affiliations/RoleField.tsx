import { Badge } from 'react-bootstrap';

import { formatRole } from '@waldur/permissions/utils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const RoleField = ({ row }) =>
  row.role_name ? (
    <Badge bg="success" text="success" className="bg-opacity-10">
      {formatRole(row.role_name)}
    </Badge>
  ) : (
    DASH_ESCAPE_CODE
  );
