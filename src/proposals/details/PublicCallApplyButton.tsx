import { useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/types';
import { useDispatch } from 'react-redux';
import { ProtectedRound } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showInfo } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

import { Call } from '../types';
import { getRoundsWithStatus } from '../utils';

interface PublicCallApplyButtonProps {
  call: Call;
  /** Preferred round */
  round?: ProtectedRound;
  title?: string;
  variant?: Variant;
  className?: string;
}

const ProposalCreateDialog = lazyComponent(() =>
  import('@waldur/proposals/proposal/create/AddProposalDialog').then(
    (module) => ({ default: module.AddProposalDialog }),
  ),
);

export const PublicCallApplyButton: FC<PublicCallApplyButtonProps> = ({
  call,
  round,
  title = translate('Apply to round'),
  variant = 'primary',
  className,
}) => {
  const user = useUser();
  const router = useRouter();
  const tooltip = translate('Please log in to submit a proposal.');
  const activeRound =
    call.state == 'active' &&
    useMemo(() => {
      if (round) {
        if (round.status === 'open') {
          return round;
        }
        return null;
      }
      const items = getRoundsWithStatus(call.rounds);
      const first = items[0];
      if (
        first &&
        (first.status.value === 'open' || first.status.value === 'scheduled')
      ) {
        return first;
      }
      return null;
    }, [call, round]);

  const dispatch = useDispatch();
  const openAddProposalDialog = useCallback(
    (e) => {
      if (!user) {
        router.stateService.go('login', {
          toState: 'calls-for-proposals',
          toParams: { call_uuid: call.uuid },
        });
        dispatch(showInfo(tooltip));
      }
      if (
        isFeatureVisible(MarketplaceFeatures.call_only) &&
        call.external_url
      ) {
        document.location.href = call.external_url;
      } else if (activeRound) {
        dispatch(
          openModalDialog(ProposalCreateDialog, {
            resolve: { call, round_uuid: activeRound.uuid },
            size: 'lg',
          }),
        );
      }
      e.preventDefault();
    },
    [dispatch, activeRound],
  );
  if (isFeatureVisible(MarketplaceFeatures.call_only) && !call.external_url) {
    return null;
  }

  return activeRound ? (
    <Button
      variant={variant}
      className={className}
      onClick={openAddProposalDialog}
      title={!user ? tooltip : undefined}
    >
      {title}
    </Button>
  ) : (
    <Button variant={variant} className={className} disabled>
      {title}
    </Button>
  );
};
