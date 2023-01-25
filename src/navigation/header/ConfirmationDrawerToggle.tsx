import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { getProjectUpdateRequestsList } from '@waldur/marketplace-remote/api';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { getOrderItemList } from '@waldur/marketplace/common/api';

import { HeaderButtonBullet } from './HeaderButtonBullet';

const PendingConfirmationContainer = lazyComponent(
  () => import('./confirmation-drawer/PendingConfirmationContainer'),
  'PendingConfirmationContainer',
);

const icon = require('@waldur/images/clipboard-check.svg');

export const ConfirmationDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();

  // fetch pending order items uuid, just to know if we have an item or not. we use it to show blinking dot also.
  const { value: pendingOrderFlag } = useAsync(() =>
    getOrderItemList({
      page_size: 1,
      state: 'pending',
      field: 'uuid',
      can_manage_as_owner: 'True',
    }),
  );
  const { value: pendingProviderFlag } = useAsync(() =>
    getOrderItemList({
      page_size: 1,
      offering_type: [REMOTE_OFFERING_TYPE, 'Marketplace.Basic'],
      state: 'executing',
      field: 'uuid',
      can_manage_as_service_provider: 'True',
    }),
  );
  const { value: pendingProjectUpdatesFlag } = useAsync(() =>
    getProjectUpdateRequestsList({
      page_size: 1,
      state: 'pending',
      field: 'uuid',
    }),
  );

  const pendingOrdersCount = pendingOrderFlag?.length || 0;
  const pendingProvidersCount = pendingProviderFlag?.length || 0;
  const pendingProjectUpdatesCount = pendingProjectUpdatesFlag?.length || 0;

  const showBullet = Boolean(
    pendingOrdersCount || pendingProvidersCount || pendingProjectUpdatesCount,
  );

  const openDrawer = () => {
    dispatch(
      openDrawerDialog(PendingConfirmationContainer, {
        title: translate('Pending confirmations'),
        props: {
          pendingOrdersCount,
          pendingProvidersCount,
          pendingProjectUpdatesCount,
        },
      }),
    );
  };

  return (
    <div className="d-flex align-items-center ms-1 ms-lg-3">
      <div
        id="pending-confirmations-toggle"
        className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary position-relative w-35px h-35px w-md-40px h-md-40px"
        onClick={openDrawer}
      >
        <InlineSVG path={icon} className="svg-icon-1" />
        {showBullet && <HeaderButtonBullet />}
      </div>
    </div>
  );
};
