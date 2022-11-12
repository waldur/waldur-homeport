import { Link } from '@waldur/core/Link';
import { BackendIdTip } from '@waldur/core/Tooltip';

export const OfferingNameColumn = ({ row }) => (
  <Link
    state="marketplace-offering-details"
    params={{ offering_uuid: row.uuid, uuid: row.customer_uuid }}
  >
    {row.name}
    <BackendIdTip backendId={row.backend_id} />
  </Link>
);
