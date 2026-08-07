import { act, renderHook } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplacePublicOfferingsRetrieve,
  proposalPublicCallsList,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { isProposalRequestEnabled } from '@/marketplace/serviceAccessMode';
import { useModal } from '@/modal/actions';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { router as globalRouter } from '@/router';
import { useUser } from '@/workspace/hooks';

import { useOfferingAccess } from './useOfferingAccess';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: vi.fn(),
}));

vi.mock('@/marketplace/serviceAccessMode', () => ({
  isProposalRequestEnabled: vi.fn(),
  // These tests cover the routing, not the wording; the calls vocabulary is
  // the default and keeps the assertions readable.
  hasCallVocabulary: vi.fn(() => true),
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermissionOnAnyScope: vi.fn(),
}));

const offering = {
  uuid: 'offering-uuid',
  name: 'GPU Cluster',
  customer_name: 'Acme',
  state: 'Active',
  shared: true,
  open_for_proposals: true,
  // Present on the detail payload; catalogue cards omit it.
  organization_groups: [],
} as any;

const render = (over: Record<string, unknown> = {}, options = {}) =>
  renderHook(() => useOfferingAccess({ ...offering, ...over }, options));

const click = async (over: Record<string, unknown> = {}, options = {}) => {
  const { result } = render(over, options);
  await act(async () => {
    await result.current.handleRequestAccess();
  });
  return result;
};

/**
 * The one chooser dialog, told apart from the downstream proposal form by the
 * `methods` it resolves.
 */
const chooserCalls = () =>
  vi
    .mocked(useModal().openDialog)
    .mock.calls.filter(([, props]) => (props as any)?.resolve?.methods);

/** The proposal form, opened once there is nothing left to choose. */
const proposalFormCalls = () =>
  vi
    .mocked(useModal().openDialog)
    .mock.calls.filter(([, props]) => (props as any)?.resolve?.round);

const callsResponse = (...uuids: string[]) => ({
  data: uuids.map((uuid) => ({
    uuid,
    name: `Call ${uuid}`,
    rounds: [
      {
        uuid: `r-${uuid}`,
        status: 'open',
        cutoff_time: `2026-0${uuids.indexOf(uuid) + 1}-01`,
      },
    ],
  })),
});

/** One call carrying two open rounds — a real choice within a single call. */
const callWithTwoRounds = () => ({
  data: [
    {
      uuid: 'call-1',
      name: 'Call call-1',
      rounds: [
        { uuid: 'r-open', status: 'open', cutoff_time: '2026-01-01' },
        { uuid: 'r-later', status: 'open', cutoff_time: '2026-06-01' },
      ],
    },
  ],
});

/** A call whose only round has not started yet. */
const callWithScheduledRoundOnly = () => ({
  data: [
    {
      uuid: 'call-1',
      name: 'Call call-1',
      rounds: [
        { uuid: 'r-next', status: 'scheduled', cutoff_time: '2027-01-01' },
      ],
    },
  ],
});

/** Both routes open: applying reachable, ordering permitted. */
const bothAvailable = () => {
  vi.mocked(isProposalRequestEnabled).mockReturnValue(true);
  vi.mocked(isFeatureVisible).mockReturnValue(false);
  vi.mocked(hasPermissionOnAnyScope).mockReturnValue(true);
};

describe('useOfferingAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    vi.mocked(useModal().confirm).mockResolvedValue(undefined as any);
    vi.mocked(proposalPublicCallsList).mockResolvedValue(
      callsResponse('call-1') as any,
    );
    vi.mocked(marketplacePublicOfferingsRetrieve).mockResolvedValue({
      data: { ...offering, organization_groups: [{ uuid: 'group-1' }] },
    } as any);
    bothAvailable();
  });

  describe('visibility', () => {
    it('is visible when either route is open', () => {
      expect(render().result.current.visible).toBe(true);
      expect(render({ open_for_proposals: false }).result.current.visible).toBe(
        true,
      );
    });

    it('is hidden when neither route is open', () => {
      vi.mocked(hasPermissionOnAnyScope).mockReturnValue(false);
      expect(render({ open_for_proposals: false }).result.current.visible).toBe(
        false,
      );
    });

    // catalogue_only closes ordering, not applying. The two used to be tangled
    // through show_proposal_requests; they are separate settings now, so a
    // browse-only catalogue can still take applications.
    it('keeps the application route in a catalogue_only deployment', () => {
      vi.mocked(isFeatureVisible).mockImplementation(
        (feature) => feature === MarketplaceFeatures.catalogue_only,
      );

      const { result } = render();

      expect(result.current.visible).toBe(true);
    });

    it('is hidden in catalogue_only when applying is off too', () => {
      vi.mocked(isFeatureVisible).mockImplementation(
        (feature) => feature === MarketplaceFeatures.catalogue_only,
      );
      vi.mocked(isProposalRequestEnabled).mockReturnValue(false);

      expect(render().result.current.visible).toBe(false);
    });

    it('is visible for an offering only reachable through a call', () => {
      vi.mocked(hasPermissionOnAnyScope).mockReturnValue(false);
      expect(render().result.current.visible).toBe(true);
    });
  });

  describe('choosing a route', () => {
    it('asks which route when both are open', async () => {
      await click();
      const [[, props]] = chooserCalls();
      expect((props as any).resolve.methods.map((m) => m.key)).toEqual([
        'order',
        'apply',
      ]);
    });

    // Regression: the picker used to be a second popup after this one.
    it('carries the rounds into the same dialog as the routes', async () => {
      vi.mocked(proposalPublicCallsList).mockResolvedValue(
        callsResponse('call-1', 'call-2') as any,
      );
      await click();

      expect(chooserCalls()).toHaveLength(1);
      const [[, props]] = chooserCalls();
      expect((props as any).resolve.rounds.map((r) => r.uuid)).toEqual([
        'r-call-1',
        'r-call-2',
      ]);
      expect(proposalFormCalls()).toHaveLength(0);
    });

    // A proposal is created on a round, so two live rounds on one call is a
    // real choice — it used to resolve to the open one with no way to the next.
    it('offers each open round of a single call, soonest deadline first', async () => {
      vi.mocked(proposalPublicCallsList).mockResolvedValue(
        callWithTwoRounds() as any,
      );
      await click();

      const [[, props]] = chooserCalls();
      expect((props as any).resolve.rounds.map((r) => r.round.uuid)).toEqual([
        'r-open',
        'r-later',
      ]);
    });

    // A round that has not started asks the user to commit to a deadline they
    // cannot act on yet, so applying is not offered at all.
    it('ignores a round that has not opened yet', async () => {
      vi.mocked(proposalPublicCallsList).mockResolvedValue(
        callWithScheduledRoundOnly() as any,
      );
      await click();

      expect(chooserCalls()).toHaveLength(0);
      expect(globalRouter.stateService.go).toHaveBeenCalledWith(
        'marketplace-offering-public',
        expect.objectContaining({ offering_uuid: 'offering-uuid' }),
      );
    });

    // Applying is only on offer if there is somewhere to submit.
    it('drops the application route when no round accepts the offering', async () => {
      vi.mocked(proposalPublicCallsList).mockResolvedValue({ data: [] } as any);
      await click();

      expect(chooserCalls()).toHaveLength(0);
      expect(globalRouter.stateService.go).toHaveBeenCalledWith(
        'marketplace-offering-public',
        { offering_uuid: 'offering-uuid' },
      );
    });

    // A dialog offering one way in is a click the user did not need to make.
    it('goes straight to ordering when applying is unavailable', async () => {
      await click({ open_for_proposals: false });
      expect(globalRouter.stateService.go).toHaveBeenCalledWith(
        'marketplace-offering-public',
        { offering_uuid: 'offering-uuid' },
      );
      expect(chooserCalls()).toHaveLength(0);
      expect(proposalPublicCallsList).not.toHaveBeenCalled();
    });

    // One route, one call: nothing to choose, so skip the chooser entirely.
    it('goes straight to the proposal form for a single round', async () => {
      vi.mocked(hasPermissionOnAnyScope).mockReturnValue(false);
      await click();
      expect(chooserCalls()).toHaveLength(0);
      expect(proposalFormCalls()).toHaveLength(1);
      expect(globalRouter.stateService.go).not.toHaveBeenCalled();
    });

    it('still asks which round when applying is the only route', async () => {
      vi.mocked(hasPermissionOnAnyScope).mockReturnValue(false);
      vi.mocked(proposalPublicCallsList).mockResolvedValue(
        callsResponse('call-1', 'call-2') as any,
      );
      await click();

      const [[, props]] = chooserCalls();
      expect((props as any).resolve.methods.map((m) => m.key)).toEqual([
        'apply',
      ]);
      expect((props as any).resolve.rounds).toHaveLength(2);
    });

    // The order gate is false exactly for the user the call route exists for.
    it('does not let an order-only block hide the application route', async () => {
      const { result } = render({}, { orderDisabledReason: 'No plan for you' });
      expect(result.current.disabled).toBe(false);
      await act(async () => {
        await result.current.handleRequestAccess();
      });
      expect(proposalPublicCallsList).toHaveBeenCalled();
      expect(chooserCalls()).toHaveLength(0);
      expect(proposalFormCalls()).toHaveLength(1);
    });
  });

  // Cards fetch a sparse offering. The project picker filters on
  // organization_groups and plugin_options, so without them it would offer
  // organizations the offering restricts.
  describe('sparse offering from a catalogue card', () => {
    it('loads the detail before showing the project picker', async () => {
      await click({ organization_groups: undefined });

      expect(marketplacePublicOfferingsRetrieve).toHaveBeenCalledWith({
        path: { uuid: 'offering-uuid' },
      });
      const [[, props]] = chooserCalls();
      expect((props as any).resolve.offering.organization_groups).toEqual([
        { uuid: 'group-1' },
      ]);
    });

    it('does not refetch when the fields are already there', async () => {
      await click();
      expect(marketplacePublicOfferingsRetrieve).not.toHaveBeenCalled();
    });

    // A private offering is bound to its own project, so there is no picker.
    it('does not refetch for a non-shared offering', async () => {
      await click({ shared: false, organization_groups: undefined });
      expect(marketplacePublicOfferingsRetrieve).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('blocks both routes for a paused offering and explains why', async () => {
      const { result } = render({
        state: 'Paused',
        paused_reason: 'Maintenance',
      });
      expect(result.current.visible).toBe(true);
      expect(result.current.disabled).toBe(true);
      expect(result.current.disabledReason).toBe('Maintenance');

      await act(async () => {
        await result.current.handleRequestAccess();
      });
      expect(useModal().openDialog).not.toHaveBeenCalled();
      expect(globalRouter.stateService.go).not.toHaveBeenCalled();
    });
  });

  describe('anonymous user', () => {
    beforeEach(() => {
      vi.mocked(useUser).mockReturnValue(undefined as any);
      vi.mocked(useCurrentStateAndParams).mockReturnValue({
        state: { name: 'public-offering-details' },
        params: { uuid: 'offering-uuid' },
      } as any);
    });

    // Without toState/toParams they land on the dashboard after signing in.
    it('sends them to login with a way back to this page', async () => {
      await click();
      expect(useModal().confirm).toHaveBeenCalled();
      expect(globalRouter.stateService.go).toHaveBeenCalledWith('login', {
        toState: 'public-offering-details',
        toParams: { uuid: 'offering-uuid' },
      });
      expect(chooserCalls()).toHaveLength(0);
    });

    it('stays put when the login prompt is dismissed', async () => {
      vi.mocked(useModal().confirm).mockRejectedValue(undefined as any);
      await click();
      expect(globalRouter.stateService.go).not.toHaveBeenCalled();
    });
  });
});
