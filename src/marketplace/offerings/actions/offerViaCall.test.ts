import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsList,
  proposalProtectedCallsActivate,
  proposalProtectedCallsCreate,
  proposalProtectedCallsOfferingsSet,
  proposalProtectedCallsRoundsSet,
  proposalRequestedOfferingsAccept,
} from 'waldur-js-client';

import { offerViaCall, OfferViaCallStep } from './offerViaCall';

// ENV comes from the global config mock in test/setupTests.js.
const API = 'http://localhost:8080/api';

const input = {
  offeringUuid: 'offering-uuid',
  customerUuid: 'customer-uuid',
  name: 'HPC access',
  cutoffTime: '2027-01-01T23:59:59.000Z',
  planUuid: 'plan-uuid',
};

const arrange = ({ existingOrganisation = false } = {}) => {
  vi.mocked(callManagingOrganisationsList).mockResolvedValue({
    data: existingOrganisation ? [{ url: 'https://cmo/existing/' }] : [],
  } as any);
  vi.mocked(callManagingOrganisationsCreate).mockResolvedValue({
    data: { url: 'https://cmo/new/' },
  } as any);
  vi.mocked(proposalProtectedCallsCreate).mockResolvedValue({
    data: { uuid: 'call-uuid' },
  } as any);
  vi.mocked(proposalProtectedCallsRoundsSet).mockResolvedValue({} as any);
  vi.mocked(proposalProtectedCallsOfferingsSet).mockResolvedValue({
    data: { uuid: 'requested-offering-uuid' },
  } as any);
  vi.mocked(proposalRequestedOfferingsAccept).mockResolvedValue({} as any);
  vi.mocked(proposalProtectedCallsActivate).mockResolvedValue({} as any);
};

describe('offerViaCall', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the new call and runs every step in order', async () => {
    arrange();
    const steps: OfferViaCallStep[] = [];
    const callUuid = await offerViaCall({
      ...input,
      onProgress: (step) => steps.push(step),
    });

    expect(callUuid).toBe('call-uuid');
    expect(steps).toEqual([
      'organisation',
      'call',
      'round',
      'offering',
      'accept',
      'activate',
    ]);
  });

  it('reuses an existing managing organisation', async () => {
    arrange({ existingOrganisation: true });
    await offerViaCall(input);

    expect(callManagingOrganisationsCreate).not.toHaveBeenCalled();
    expect(proposalProtectedCallsCreate).toHaveBeenCalledWith({
      body: { name: 'HPC access', manager: 'https://cmo/existing/' },
    });
  });

  it('registers a managing organisation when the customer has none', async () => {
    arrange();
    await offerViaCall(input);

    expect(callManagingOrganisationsCreate).toHaveBeenCalledWith({
      body: {
        customer: `${API}/customers/customer-uuid/`,
      },
    });
    expect(proposalProtectedCallsCreate).toHaveBeenCalledWith({
      body: { name: 'HPC access', manager: 'https://cmo/new/' },
    });
  });

  // activate() refuses a call whose accepted offering carries no plan, so the
  // plan has to travel with the offering rather than being set afterwards.
  it('lists the offering against its plan', async () => {
    arrange();
    await offerViaCall(input);

    expect(proposalProtectedCallsOfferingsSet).toHaveBeenCalledWith({
      path: { uuid: 'call-uuid' },
      body: {
        offering: `${API}/marketplace-public-offerings/offering-uuid/`,
        plan: `${API}/marketplace-plans/plan-uuid/`,
      },
    });
  });

  it('accepts the call entry it just created', async () => {
    arrange();
    await offerViaCall(input);

    expect(proposalRequestedOfferingsAccept).toHaveBeenCalledWith({
      path: { uuid: 'requested-offering-uuid' },
    });
  });

  it('opens the submission window at the requested cutoff', async () => {
    arrange();
    await offerViaCall(input);

    const [args] = vi.mocked(proposalProtectedCallsRoundsSet).mock.calls[0];
    expect(args.path).toEqual({ uuid: 'call-uuid' });
    expect(args.body.cutoff_time).toBe(input.cutoffTime);
    expect(Date.parse(args.body.start_time)).not.toBeNaN();
  });

  // A half-built call is inert rather than broken, but the caller has to learn
  // which step failed — so the rejection must propagate, not be swallowed.
  it('stops at the failing step and propagates the error', async () => {
    arrange();
    vi.mocked(proposalProtectedCallsRoundsSet).mockRejectedValue(
      new Error('cutoff in the past'),
    );
    const steps: OfferViaCallStep[] = [];

    await expect(
      offerViaCall({ ...input, onProgress: (step) => steps.push(step) }),
    ).rejects.toThrow('cutoff in the past');

    expect(steps).toEqual(['organisation', 'call', 'round']);
    expect(proposalProtectedCallsOfferingsSet).not.toHaveBeenCalled();
    expect(proposalProtectedCallsActivate).not.toHaveBeenCalled();
  });
});
