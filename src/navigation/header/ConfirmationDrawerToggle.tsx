import { BellIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { marketplaceProjectUpdateRequestsCount } from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { useDrawer } from '@/drawer/actions';
import { DrawerExpandToolbar } from '@/drawer/DrawerExpandToolbar';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';
import { isDrawerOpenWithClass } from '@/drawer/utils';
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
  const { openDrawer, closeDrawer } = useDrawer();

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
          ? await marketplaceProjectUpdateRequestsCount({
              query: { state: ['pending'] },
            }).then(fetchResultCount)
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

  const handleOpenDrawer = () => {
    if (isDrawerOpenWithClass(DRAWER_SHELL_CLASS.confirmation)) {
      closeDrawer();
      return;
    }
    document
      .getElementById('kt_drawer')
      ?.classList.add(DRAWER_SHELL_CLASS.confirmation);
    openDrawer(PendingConfirmationContainer, {
      title: translate('Pending confirmations'),
      toolbar: DrawerExpandToolbar,
      ...counters,
    });
  };

  return (
    <div className="d-flex align-items-center ms-1">
      <Tip
        label={translate('Pending tasks')}
        id="pending-confirmations-tip"
        placement="bottom"
      >
        <button
          id="pending-confirmations-toggle"
          type="button"
          className="position-relative btn-nav-item"
          onClick={handleOpenDrawer}
          aria-label={translate('Pending tasks')}
        >
          <span className="svg-icon svg-icon-2">
            <BellIcon weight="bold" />
          </span>
          {showBullet && <HeaderButtonBullet />}
        </button>
      </Tip>
    </div>
  );
};
