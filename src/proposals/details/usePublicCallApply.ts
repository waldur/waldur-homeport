import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback, useMemo } from 'react';
import {
  NestedRound,
  proposalPublicCallsCheckEligibilityRetrieve,
  ProtectedRound,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
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
    // Any open round, not merely the first in the list: rounds come back
    // unsorted, so taking rounds[0] hid the Apply action on a call whose open
    // round happened to follow an ended one. A scheduled round is not offered —
    // the backend refuses a proposal until its round opens.
    const items = getRoundsWithStatus(call.rounds);
    return items.find((item) => item.status.value === 'open') || null;
  }, [call, preferredRound]);

  const callOnly = isFeatureVisible(MarketplaceFeatures.call_only);
  const hidden = callOnly && !call.external_url;

  // Asked only where the answer can be "no": the endpoint needs a user, and in
  // call-only mode Apply leaves for the call's external site. Unrestricted
  // calls skip it, so a list of call cards costs no request per card.
  // A strict boolean: react-query reads `enabled: undefined` as enabled.
  const checksEligibility =
    !!user && call.has_eligibility_restrictions === true && !callOnly;
  const { data: eligibility, isLoading: eligibilityLoading } = useQuery({
    queryKey: ['PublicCallEligibility', call.uuid, user?.uuid],
    queryFn: () =>
      proposalPublicCallsCheckEligibilityRetrieve({
        path: { uuid: call.uuid },
      }).then((response) => response.data),
    enabled: checksEligibility,
    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  // A failed check leaves Apply enabled: proposal creation re-validates the
  // user, so the backend still refuses an ineligible applicant.
  const ineligible = eligibility?.is_eligible === false;

  const disabledReason = !activeRound
    ? translate('No open round available.')
    : ineligible
      ? translate('You are not eligible to apply to this call.')
      : eligibilityLoading
        ? translate('Checking eligibility…')
        : undefined;

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
      if (ineligible) {
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
    [activeRound, ineligible, user, router, call],
  );

  return { activeRound, hidden, handleApply, ineligible, disabledReason };
};
