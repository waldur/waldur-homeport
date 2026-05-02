import { useRouter } from '@uirouter/react';
import { useCallback, useMemo } from 'react';
import { NestedRound, ProtectedRound } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { Call } from '../types';
import { getRoundsWithStatus } from '../utils';

const ProposalCreateDialog = lazyComponent(() =>
  import('@/proposals/proposal/create/AddProposalDialog').then((module) => ({
    default: module.AddProposalDialog,
  })),
);

export const usePublicCallApply = (
  call: Call,
  preferredRound?: ProtectedRound,
) => {
  const user = useUser();
  const router = useRouter();

  const { openDialog } = useModal();
  const { showInfo } = useNotify();

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
        showInfo(translate('Please log in to submit a proposal.'));
        e?.preventDefault();
        return;
      }
      if (
        isFeatureVisible(MarketplaceFeatures.call_only) &&
        call.external_url
      ) {
        document.location.href = call.external_url;
      } else if (activeRound) {
        openDialog(ProposalCreateDialog, {
          resolve: {
            call,
            round: activeRound as unknown as NestedRound,
          },
        });
      }
      e?.preventDefault();
    },
    [activeRound, user, router, call],
  );

  return { activeRound, hidden, handleApply };
};
