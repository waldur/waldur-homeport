import { useSelector } from 'react-redux';

import { Link } from '@/core/Link';
import { BackendIdTip } from '@/core/Tooltip';
import { getCustomer } from '@/workspace/selectors';

export const OfferingNameColumn = ({ row }) => {
  const customer = useSelector(getCustomer);
  return (
    <>
      <Link
        state="marketplace-offering-details"
        params={{ offering_uuid: row.uuid, uuid: customer.uuid }}
      >
        {row.name}
        <BackendIdTip backendId={row.backend_id} />
      </Link>
      <div className="text-gray">{row.category_title}</div>
    </>
  );
};
