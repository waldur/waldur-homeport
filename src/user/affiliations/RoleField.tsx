import { Badge } from 'react-bootstrap';

import { formatRole } from '@waldur/core/utils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const RoleField = ({ row }) =>
  row.role ? (
    <Badge bg="success" text="success" className="bg-opacity-10">
      {formatRole(row.role)}
    </Badge>
  ) : (
    DASH_ESCAPE_CODE
  );
