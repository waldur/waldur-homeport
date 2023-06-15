import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { countProjectUpdateRequestsList } from '@waldur/marketplace-remote/api';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { countOrderItems } from '@waldur/marketplace/common/api';

import { HeaderButtonBullet } from './HeaderButtonBullet';

const PendingConfirmationContainer = lazyComponent(
  () => import('./confirmation-drawer/PendingConfirmationContainer'),
  'PendingConfirmationContainer',
);

const icon = require('@waldur/images/clipboard-check.svg');

export const ConfirmationDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();

  const { value: counters } = useAsync(async () => {
    const pendingOrdersCount = await countOrderItems({
      state: 'pending',
      can_manage_as_owner: 'True',
    });
    const pendingProvidersCount = await countOrderItems({
      offering_type: [REMOTE_OFFERING_TYPE, 'Marketplace.Basic'],
      state: 'executing',
      can_manage_as_service_provider: 'True',
    });
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
      <div
        id="pending-confirmations-toggle"
        className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary position-relative w-35px h-35px w-md-40px h-md-40px"
        onClick={openDrawer}
      >
        <InlineSVG
          path={icon}
          className="svg-icon-1"
          tooltipText={translate('Pending tasks')}
          tooltipClassName="z-index-100"
        />
        {showBullet && <HeaderButtonBullet />}
      </div>
    </div>
  );
};
