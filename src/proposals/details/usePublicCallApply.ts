import { useRouter } from '@uirouter/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { NestedRound, ProtectedRound } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showInfo } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

import { Call } from '../types';
import { getRoundsWithStatus } from '../utils';

const ProposalCreateDialog = lazyComponent(() =>
  import('@waldur/proposals/proposal/create/AddProposalDialog').then(
    (module) => ({ default: module.AddProposalDialog }),
  ),
);

export const usePublicCallApply = (
  call: Call,
  preferredRound?: ProtectedRound,
) => {
  const user = useUser();
  const router = useRouter();
  const dispatch = useDispatch();

  const activeRound = useMemo(() => {
    if (call.state !== 'active') return null;
    if (preferredRound) {
      return preferredRound.status === 'open' ? preferredRound : null;
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
  }, [call, preferredRound]);

  const hidden =
    isFeatureVisible(MarketplaceFeatures.call_only) && !call.external_url;

  const handleApply = useCallback(
    (e?: React.MouseEvent) => {
      if (!user) {
        router.stateService.go('login', {
          toState: 'calls-for-proposals',
          toParams: { call_uuid: call.uuid },
        });
        dispatch(showInfo(translate('Please log in to submit a proposal.')));
        e?.preventDefault();
        return;
      }
      if (
        isFeatureVisible(MarketplaceFeatures.call_only) &&
        call.external_url
      ) {
        document.location.href = call.external_url;
      } else if (activeRound) {
        dispatch(
          openModalDialog(ProposalCreateDialog, {
            resolve: {
              call,
              round: activeRound as unknown as NestedRound,
            },
          }),
        );
      }
      e?.preventDefault();
    },
    [dispatch, activeRound, user, router, call],
  );

  return { activeRound, hidden, handleApply };
};
