import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { BackendIdTip } from '@waldur/core/Tooltip';
import { isDescendantOf } from '@waldur/navigation/useTabs';

export const OfferingNameColumn = ({ row }) => {
  const { state } = useCurrentStateAndParams();
  const target = useMemo(() => {
    if (isDescendantOf('organization', state)) {
      return 'marketplace-offering-details';
    } else if (isDescendantOf('admin', state)) {
      return 'admin.marketplace-offering-details';
    }
  }, [state]);
  return (
    <Link
      state={target}
      params={{ offering_uuid: row.uuid, uuid: row.customer_uuid }}
    >
      {row.name}
      <BackendIdTip backendId={row.backend_id} />
    </Link>
  );
};
