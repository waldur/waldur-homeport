import { BellRinging } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { countProjectUpdateRequestsList } from '@waldur/marketplace-remote/api';
import { countOrders } from '@waldur/marketplace/common/api';

import {
  PENDING_CONSUMER_ORDERS_FILTER,
  PENDING_PROVIDER_ORDERS_FILTER,
} from './confirmation-drawer/constants';
import { HeaderButtonBullet } from './HeaderButtonBullet';

const PendingConfirmationContainer = lazyComponent(
  () => import('./confirmation-drawer/PendingConfirmationContainer'),
  'PendingConfirmationContainer',
);

export const ConfirmationDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();

  const { value: counters } = useAsync(async () => {
    const pendingOrdersCount = await countOrders(
      PENDING_CONSUMER_ORDERS_FILTER,
    );
    const pendingProvidersCount = await countOrders(
      PENDING_PROVIDER_ORDERS_FILTER,
    );
    const pendingProjectUpdatesCount = await countProjectUpdateRequestsList({
      state: 'pending',
    });
    return {
      pendingOrdersCount,
      pendingProvidersCount,
      pendingProjectUpdatesCount,
    };
  });

  const showBullet = Boolean(
    counters?.pendingOrdersCount ||
      counters?.pendingProvidersCount ||
      counters?.pendingProjectUpdatesCount,
  );

  const openDrawer = () => {
    dispatch(
      openDrawerDialog(PendingConfirmationContainer, {
        title: translate('Pending confirmations'),
        props: counters,
      }),
    );
  };

  return (
    <div className="d-flex align-items-center ms-1 ms-lg-3">
      <button
        id="pending-confirmations-toggle"
        type="button"
        className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary position-relative w-35px h-35px w-md-40px h-md-40px"
        onClick={openDrawer}
      >
        <span
          className="svg-icon-1 text-gray"
          title={translate('Pending tasks')}
        >
          <BellRinging size={25} />
        </span>
        {showBullet && <HeaderButtonBullet />}
      </button>
    </div>
  );
};
