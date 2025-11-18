import { BellIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { count } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { countOrders } from '@waldur/marketplace/common/api';

import {
  PENDING_CONSUMER_ORDERS_FILTER,
  PENDING_PROVIDER_ORDERS_FILTER,
} from './confirmation-drawer/constants';
import { HeaderButtonBullet } from './HeaderButtonBullet';

const PendingConfirmationContainer = lazyComponent(() =>
  import('./confirmation-drawer/PendingConfirmationContainer').then(
    (module) => ({ default: module.PendingConfirmationContainer }),
  ),
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
    const pendingProjectUpdatesCount = await count(
      '/api/marketplace-project-update-requests/',
      { state: ['pending'] },
    );
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
    <div className="d-flex align-items-center ms-1">
      <button
        id="pending-confirmations-toggle"
        type="button"
        className="position-relative btn-nav-item"
        onClick={openDrawer}
      >
        <span
          className="svg-icon svg-icon-2"
          title={translate('Pending tasks')}
        >
          <BellIcon weight="bold" />
        </span>
        {showBullet && <HeaderButtonBullet />}
      </button>
    </div>
  );
};
