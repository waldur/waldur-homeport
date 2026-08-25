import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callManagingOrganisationsCreate,
  callManagingOrganisationsList,
  proposalProtectedCallsActivate,
  proposalProtectedCallsCreate,
  proposalProtectedCallsOfferingsSet,
  proposalProtectedCallsRoundsSet,
  proposalProtectedCallsWorkflowStepsList,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
  proposalRequestedOfferingsAccept,
} from 'waldur-js-client';

import { offerViaCall, OfferViaCallStep } from './offerViaCall';

// ENV comes from the global config mock in test/setupTests.js.
const API = 'http://localhost:8080/api';

const input = {
  offeringUuid: 'offering-uuid',
  managerCustomerUuid: 'manager-customer-uuid',
  name: 'HPC access',
  cutoffTime: '2027-01-01T23:59:59.000Z',
  planUuid: 'plan-uuid',
  enabledSteps: [],
};

/** What the backend seeds a fresh call with today. */
const seededSteps = [
  { uuid: 'admin-step', step: 'administrative_check', is_enabled: true },
  { uuid: 'technical-step', step: 'technical_assessment', is_enabled: false },
  { uuid: 'expert-step', step: 'expert_review', is_enabled: false },
  { uuid: 'panel-step', step: 'panel_review', is_enabled: false },
  {
    uuid: 'allocation-step',
    step: 'allocation_decision',
    is_enabled: true,
    is_mandatory: true,
  },
];

const arrange = ({
  existingOrganisation = false,
  steps = seededSteps,
} = {}) => {
  vi.mocked(callManagingOrganisationsList).mockResolvedValue({
    data: existingOrganisation ? [{ url: 'https://cmo/existing/' }] : [],
  } as any);
  vi.mocked(callManagingOrganisationsCreate).mockResolvedValue({
    data: { url: 'https://cmo/new/' },
  } as any);
  vi.mocked(proposalProtectedCallsCreate).mockResolvedValue({
    data: { uuid: 'call-uuid' },
  } as any);
  vi.mocked(proposalProtectedCallsWorkflowStepsList).mockResolvedValue({
    data: steps,
  } as any);
  vi.mocked(proposalProtectedCallsWorkflowStepsPartialUpdate).mockResolvedValue(
    {} as any,
  );
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
      'workflow',
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
        customer: `${API}/customers/manager-customer-uuid/`,
      },
    });
    expect(proposalProtectedCallsCreate).toHaveBeenCalledWith({
      body: { name: 'HPC access', manager: 'https://cmo/new/' },
    });
  });

  // The call manager is whoever was picked in the dialog, not the offering's
  // own organisation — the two are routinely different.
  it('looks the managing organisation up against the chosen organisation', async () => {
    arrange({ existingOrganisation: true });
    await offerViaCall(input);

    expect(callManagingOrganisationsList).toHaveBeenCalledWith({
      query: { customer_uuid: 'manager-customer-uuid' },
    });
  });

  // A request that has to clear an administrative check before anyone can act
  // on it is a review workflow; by default this action promises a single
  // approve/reject, so the step the backend seeds on has to be switched off.
  it('leaves the allocation decision as the only enabled step by default', async () => {
    arrange();
    await offerViaCall(input);

    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).toHaveBeenCalledTimes(1);
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).toHaveBeenCalledWith({
      path: { uuid: 'call-uuid', obj_uuid: 'admin-step' },
      body: { is_enabled: false },
    });
  });

  it('keeps a requested step that the backend already seeded on', async () => {
    arrange();
    await offerViaCall({ ...input, enabledSteps: ['administrative_check'] });

    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).not.toHaveBeenCalled();
  });

  // Dependents are torn down before the step they depend on, dependencies
  // switched on before the steps that need them — no intermediate state where
  // a dependent outlives its dependency.
  it('enables requested steps in dependency order, disabling first', async () => {
    arrange();
    await offerViaCall({
      ...input,
      enabledSteps: ['expert_review', 'panel_review'],
    });

    const calls = vi
      .mocked(proposalProtectedCallsWorkflowStepsPartialUpdate)
      .mock.calls.map(([args]) => [args.path.obj_uuid, args.body.is_enabled]);
    expect(calls).toEqual([
      ['admin-step', false],
      ['expert-step', true],
      ['panel-step', true],
    ]);
  });

  // Disabling it would be refused by the API, and the call could not activate
  // without it.
  it('never disables the mandatory allocation step', async () => {
    arrange({
      steps: [
        {
          uuid: 'allocation-step',
          step: 'allocation_decision',
          is_enabled: true,
          is_mandatory: true,
        },
      ],
    });
    await offerViaCall(input);

    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).not.toHaveBeenCalled();
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

    expect(steps).toEqual(['organisation', 'call', 'workflow', 'round']);
    expect(proposalProtectedCallsOfferingsSet).not.toHaveBeenCalled();
    expect(proposalProtectedCallsActivate).not.toHaveBeenCalled();
  });
});
