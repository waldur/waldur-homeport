import { describe, expect, it } from 'vitest';

import {
  canOpenFinalReport,
  canRequestExtension,
  canWithdrawRun,
  cleanRunLimits,
  runEditMode,
  runGrantDiffers,
  runPartUnlocked,
} from './postAward';

const accepted = {
  state: 'accepted' as const,
  completed_at: null,
  open_run_uuid: null,
  extension_requestable_until: '2030-06-30',
  final_report_openable: true,
};

describe('canRequestExtension', () => {
  const today = new Date('2030-06-01T12:00:00Z');

  it('lets the team ask inside the window', () => {
    expect(canRequestExtension(accepted, true, today)).toBe(true);
  });

  it('keeps everyone else out', () => {
    expect(canRequestExtension(accepted, false, today)).toBe(false);
  });

  it('refuses after the window, with a run open or once completed', () => {
    expect(
      canRequestExtension(accepted, true, new Date('2030-07-01T00:00:00Z')),
    ).toBe(false);
    expect(
      canRequestExtension({ ...accepted, open_run_uuid: 'abc' }, true, today),
    ).toBe(false);
    expect(
      canRequestExtension(
        { ...accepted, completed_at: '2030-05-01T00:00:00Z' },
        true,
        today,
      ),
    ).toBe(false);
    expect(
      canRequestExtension(
        { ...accepted, extension_requestable_until: null },
        true,
        today,
      ),
    ).toBe(false);
  });
});

describe('canOpenFinalReport', () => {
  it('is for whoever drives the call, without a run open', () => {
    expect(canOpenFinalReport(accepted, true)).toBe(true);
    expect(canOpenFinalReport(accepted, false)).toBe(false);
    expect(canOpenFinalReport({ ...accepted, open_run_uuid: 'x' }, true)).toBe(
      false,
    );
  });

  it('is not offered when the call has no final report steps', () => {
    expect(
      canOpenFinalReport({ ...accepted, final_report_openable: false }, true),
    ).toBe(false);
  });
});

describe('runEditMode and canWithdrawRun', () => {
  const run = {
    phase: 'extension' as const,
    state: 'open' as const,
    active_step_kind: 'applicant_action',
  };
  const team = { actsForApplicant: true, drivesCall: false };
  const manager = { actsForApplicant: false, drivesCall: true };

  it('lets the team write the request while it is open', () => {
    expect(runEditMode(run, team)).toBe('request');
    expect(runEditMode(run, manager)).toBeNull();
    expect(canWithdrawRun(run, team)).toBe(true);
  });

  it('lets the decider write the grant while the decision runs', () => {
    const deciding = { ...run, active_step_kind: 'decision' };
    expect(runEditMode(deciding, manager)).toBe('grant');
    expect(runEditMode(deciding, team)).toBeNull();
    expect(canWithdrawRun(deciding, team)).toBe(false);
    expect(canWithdrawRun(deciding, manager)).toBe(true);
  });

  it('changes nothing on a closed run or a final report', () => {
    expect(runEditMode({ ...run, state: 'approved' }, team)).toBeNull();
    expect(runEditMode({ ...run, phase: 'closing' }, team)).toBeNull();
    expect(canWithdrawRun({ ...run, state: 'approved' }, manager)).toBe(false);
  });
});

describe('cleanRunLimits', () => {
  it('keeps the amounts given, as numbers', () => {
    expect(
      cleanRunLimits({
        a: { cpu: '200', ram: '' },
        b: { cpu: null },
      }),
    ).toEqual({ a: { cpu: 200 } });
  });
});

describe('changes asked in a run', () => {
  const asked = (parts: string[]) =>
    ({
      open_run_uuid: 'run',
      open_change_requests: [{ unlocked_parts: [] }, { unlocked_parts: parts }],
    }) as any;

  it('unlocks only the parts the request names, in an open run', () => {
    expect(runPartUnlocked(asked(['run_form']), 'run_form')).toBe(true);
    expect(runPartUnlocked(asked(['run_form']), 'run_request')).toBe(false);
    expect(
      runPartUnlocked(
        { ...asked(['run_form']), open_run_uuid: null },
        'run_form',
      ),
    ).toBe(false);
  });

  it('lets the team change the request once it is reopened', () => {
    const deciding = {
      phase: 'extension' as const,
      state: 'open' as const,
      active_step_kind: 'decision',
    };
    expect(
      runEditMode(deciding, {
        actsForApplicant: true,
        drivesCall: false,
        requestUnlocked: true,
      }),
    ).toBe('request');
  });
});

describe('runGrantDiffers', () => {
  const run = (overrides = {}) => ({
    requested_end_date: '2030-12-31',
    requested_limits: { 'resource-1': { cpu: 100 } },
    granted_end_date: null,
    granted_limits: {},
    ...overrides,
  });

  it('is false while nothing is granted', () => {
    expect(runGrantDiffers(run())).toBe(false);
  });

  it('is false when the grant matches the request', () => {
    expect(
      runGrantDiffers(
        run({
          granted_end_date: '2030-12-31',
          granted_limits: { 'resource-1': { cpu: '100' } },
        }),
      ),
    ).toBe(false);
  });

  it('is true for another end date or other limits', () => {
    expect(
      runGrantDiffers(
        run({
          granted_end_date: '2030-06-30',
          granted_limits: { 'resource-1': { cpu: 100 } },
        }),
      ),
    ).toBe(true);
    expect(
      runGrantDiffers(
        run({
          granted_end_date: '2030-12-31',
          granted_limits: { 'resource-1': { cpu: 50 } },
        }),
      ),
    ).toBe(true);
  });
});
