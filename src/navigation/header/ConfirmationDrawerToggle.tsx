import { BellIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { count } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { openDrawerDialog } from '@/drawer/actions';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { countOrders } from '@/marketplace/common/api';

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

  const showConsumerOrders = !isFeatureVisible(
    MarketplaceFeatures.conceal_pending_consumer_orders,
  );
  const showProviderOrders = !isFeatureVisible(
    MarketplaceFeatures.conceal_pending_provider_orders,
  );

  const { data: counters } = useQuery({
    queryKey: ['ConfirmationDrawerToggle'],

    queryFn: async () => {
      const pendingOrdersCount = showConsumerOrders
        ? await countOrders(PENDING_CONSUMER_ORDERS_FILTER)
        : 0;
      const pendingProvidersCount = showProviderOrders
        ? await countOrders(PENDING_PROVIDER_ORDERS_FILTER)
        : 0;
      const pendingProjectUpdatesCount =
        showConsumerOrders || showProviderOrders
          ? await count('/api/marketplace-project-update-requests/', {
              state: ['pending'],
            })
          : 0;
      return {
        pendingOrdersCount,
        pendingProvidersCount,
        pendingProjectUpdatesCount,
      };
    },
  });

  if (!showConsumerOrders && !showProviderOrders) {
    return null;
  }

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
