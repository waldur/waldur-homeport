import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { isDescendantOf } from '@waldur/navigation/useTabs';

export const OfferingEditButton = ({ offeringId }) => {
  const { state } = useCurrentStateAndParams();
  const target = useMemo(() => {
    if (state.name === 'marketplace-offering-update') {
      return 'marketplace-offering-details';
    } else if (state.name === 'admin.marketplace-offering-update') {
      return 'admin.marketplace-offering-details';
    } else if (isDescendantOf('organization', state)) {
      return 'marketplace-offering-update';
    } else if (isDescendantOf('admin', state)) {
      return 'admin.marketplace-offering-update';
    }
    return 'marketplace-offering-update';
  }, [state]);
  return (
    <Link
      className="btn btn-sm btn-primary me-2"
      state={target}
      params={{ offering_uuid: offeringId }}
    >
      {[
        'marketplace-offering-update',
        'admin.marketplace-offering-update',
      ].includes(state.name)
        ? translate('View')
        : translate('Edit')}
    </Link>
  );
};
