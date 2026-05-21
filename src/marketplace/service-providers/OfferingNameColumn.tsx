import { Link } from '@/core/Link';
import { BackendIdTip } from '@/core/Tooltip';
import { useCustomer } from '@/workspace/hooks';

export const OfferingNameColumn = ({ row }) => {
  const customer = useCustomer();
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
