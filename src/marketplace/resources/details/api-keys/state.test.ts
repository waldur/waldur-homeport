import { describe, expect, it } from 'vitest';

import {
  getAssigneeLock,
  getAtLimitReason,
  getErredTooltip,
  getFailedCommand,
  getKeyStateVariant,
  getResourcePause,
  getResourcePauseDetails,
  getStateLabel,
  getStateTooltip,
  isKeyAssignee,
} from './state';

const row = (overrides: Record<string, unknown> = {}) =>
  ({ uuid: 'k1', state: 'Erred', pending_action: '', ...overrides }) as any;

describe('getFailedCommand', () => {
  it('is the command the key kept', () => {
    expect(getFailedCommand(row({ pending_action: 'pause' }))).toBe('pause');
  });

  it('is a rotation for a key that erred before commands were recorded', () => {
    expect(getFailedCommand(row())).toBe('rotate');
  });
});

describe('isKeyAssignee', () => {
  const me = { uuid: 'me' } as any;

  it('is the user the key is assigned to', () => {
    expect(isKeyAssignee(row({ user_uuid: 'me' }), me)).toBe(true);
    expect(isKeyAssignee(row({ user_uuid: 'someone-else' }), me)).toBe(false);
  });

  it('is nobody for a key shared by the project', () => {
    expect(isKeyAssignee(row({ user_uuid: null }), me)).toBe(false);
    expect(isKeyAssignee(row(), undefined)).toBe(false);
  });
});

describe('getErredTooltip', () => {
  it('names the failed command and the error', () => {
    expect(
      getErredTooltip(
        row({ pending_action: 'pause', error_message: 'gateway down' }),
      ),
    ).toBe('Pause failed: gateway down');
  });

  // Erred alone reads as stopped, but the provider still serves the key.
  // The agent's error rarely ends with a period; the note is a sentence of
  // its own whether it does or not.
  it.each([
    ['gateway down', 'Pause failed: gateway down.'],
    ['Gateway down.', 'Pause failed: Gateway down.'],
    ['Is the gateway down?', 'Pause failed: Is the gateway down?'],
    ['', 'Pause failed.'],
  ])(
    'says a key whose limit pause failed is still active (error %j)',
    (error_message, failed) => {
      expect(
        getErredTooltip(
          row({
            pending_action: 'pause',
            paused_by_limit: true,
            error_message,
          }),
        ),
      ).toBe(
        `${failed} The key is still active at the provider until the failed command succeeds.`,
      );
    },
  );
});

describe('a key paused at its limit', () => {
  const limited = row({ state: 'Paused', paused_by_limit: true });

  // It resumes on its own, unlike a key a person paused, so it reads apart.
  it('reads apart from a key a person paused', () => {
    expect(getStateLabel(limited)).toBe('Paused at limit');
    expect(getStateLabel(row({ state: 'Paused' }))).toBe('Paused');
  });

  it('explains when it comes back', () => {
    expect(getStateTooltip(limited)).toMatch(/resumes on its own/);
    expect(getStateTooltip(row({ state: 'Paused' }))).toBe('');
  });

  it('names the limit it reached and when it resumes', () => {
    const tooltip = getStateTooltip(
      row({
        state: 'Paused',
        paused_by_limit: true,
        limit_resumes_at: '2999-01-02T00:00:00Z',
        spending_limit_status: [
          {
            component_type: 'token_cost',
            period: 'day',
            limit: 5,
            used: 5,
            resets_at: '2999-01-02T00:00:00Z',
            reached: true,
          },
          {
            component_type: 'token_cost',
            period: 'month',
            limit: 50,
            used: 5,
            resets_at: '2999-02-01T00:00:00Z',
            reached: false,
          },
        ],
      }),
      null,
      [{ type: 'token_cost', name: 'Token cost' }],
    );
    expect(tooltip).toMatch(/Daily limit of Token cost\./);
    expect(tooltip).not.toMatch(/Monthly/);
    expect(tooltip).toMatch(/It resumes .*2999/);
  });

  it('resumes shortly once the reset has passed', () => {
    expect(
      getStateTooltip(
        row({
          state: 'Paused',
          paused_by_limit: true,
          limit_resumes_at: '2000-01-02T00:00:00Z',
        }),
      ),
    ).toMatch(/resumes shortly/);
  });
});

describe('getAtLimitReason', () => {
  const status = (period: string, reached: boolean, resets_at: string) => ({
    component_type: 'tokens',
    period,
    limit: 10,
    used: reached ? 10 : 1,
    resets_at,
    reached,
  });

  it('is nothing while every limit is under', () => {
    expect(
      getAtLimitReason(
        row({
          spending_limit_status: [
            status('day', false, '2026-10-23T00:00:00Z'),
            status('month', false, '2026-11-01T00:00:00Z'),
          ],
        }),
      ),
    ).toBeUndefined();
    expect(getAtLimitReason(row({ spending_limit_status: null }))).toBe(
      undefined,
    );
  });

  // The backend refuses the assignee's rotation on any reached limit, not
  // only the month's.
  it.each([
    ['day', 'daily'],
    ['week', 'weekly'],
    ['month', 'monthly'],
    ['quarter', 'quarterly'],
    ['year', 'yearly'],
  ])('names a reached %s limit', (period, adjective) => {
    expect(
      getAtLimitReason(
        row({
          spending_limit_status: [status(period, true, '2026-11-01T00:00:00Z')],
        }),
      ),
    ).toBe(
      `This key has reached its ${adjective} limit. A manager can rotate it.`,
    );
  });

  it('names the reached limit that holds the key longest', () => {
    expect(
      getAtLimitReason(
        row({
          spending_limit_status: [
            status('day', true, '2026-10-23T00:00:00Z'),
            status('week', true, '2026-10-26T00:00:00Z'),
            status('month', false, '2026-11-01T00:00:00Z'),
          ],
        }),
      ),
    ).toBe('This key has reached its weekly limit. A manager can rotate it.');
  });
});

describe('getResourcePause', () => {
  it('is nothing on a resource that is not paused', () => {
    expect(
      getResourcePause({ paused: false, usage_limit_restriction: '' }),
    ).toBeNull();
  });

  it('is the limit when usage reaching it paused the resource', () => {
    expect(
      getResourcePause({ paused: true, usage_limit_restriction: 'paused' }),
    ).toBe('limit');
  });

  it('is another reason when a person or a policy paused it', () => {
    expect(
      getResourcePause({ paused: true, usage_limit_restriction: '' }),
    ).toBe('other');
  });
});

describe('getResourcePauseDetails', () => {
  const resource = (overrides: Record<string, unknown> = {}) =>
    ({
      usage_limit_restriction: 'paused',
      offering_components: [{ type: 'tokens', name: 'Tokens' }],
      spending_limit_status: [
        { component_type: 'tokens', period: 'day', reached: false },
        { component_type: 'tokens', period: 'month', reached: true },
      ],
      usage_limit_resumes_at: null,
      ...overrides,
    }) as any;

  // As the Usage tab does: which limit holds the resource, and until when.
  it('names the reached limit and when access resumes', () => {
    const resumesAt = new Date(Date.now() + 3 * 86400_000).toISOString();
    const details = getResourcePauseDetails(
      'limit',
      resource({ usage_limit_resumes_at: resumesAt }),
    );
    expect(details).toMatch(/^Held by: Tokens — Monthly limit\. /);
    expect(details).not.toMatch(/Daily limit/);
    expect(details).toMatch(/Access resumes .+, on .+\.$/);
  });

  it('says access resumes once under every limit when no time is known', () => {
    expect(getResourcePauseDetails('limit', resource())).toBe(
      'Held by: Tokens — Monthly limit. Access resumes once usage is under every limit of the resource again.',
    );
  });

  it('falls back to the general message without a reached limit', () => {
    expect(
      getResourcePauseDetails(
        'limit',
        resource({ spending_limit_status: null }),
      ),
    ).toMatch(/usage reached its limit/);
  });

  it('says the resource must be unpaused when paused for another reason', () => {
    expect(getResourcePauseDetails('other', resource())).toBe(
      'It resumes once the resource is unpaused.',
    );
  });
});

describe('a key on a paused resource', () => {
  const ok = row({ state: 'OK' });

  // Its own state is OK, but nothing serves it until the resource resumes.
  it('reads as blocked, not OK', () => {
    expect(getStateLabel(ok, 'limit')).toBe('Blocked: resource paused');
    expect(getKeyStateVariant(ok, 'limit').variant).toBe('warning');
    // The resource's usage, not the key's: the key may be far below its own.
    expect(getStateTooltip(ok, 'limit')).toMatch(
      /The resource's usage reached its limit\./,
    );
  });

  it('says it resumes with the resource when paused for another reason', () => {
    expect(getStateTooltip(ok, 'other')).toMatch(/resource is unpaused/);
  });

  it('keeps its own reason when it is not serving anyway', () => {
    const limited = row({ state: 'Paused', paused_by_limit: true });
    expect(getStateLabel(limited, 'limit')).toBe('Paused at limit');
    expect(getStateLabel(row({ pending_action: 'pause' }), 'limit')).toBe(
      'Erred',
    );
  });

  it('reads OK on a resource that is not paused', () => {
    expect(getStateLabel(ok, null)).toBe('OK');
    expect(getKeyStateVariant(ok, null).variant).toBe('success');
  });
});

describe('getAssigneeLock', () => {
  const key = (overrides: Record<string, unknown>) =>
    row({ client_id: 'KEY1', state: 'OK', ...overrides });

  it('leaves the assignee open on an active key', () => {
    expect(getAssigneeLock(key({}))).toBeUndefined();
  });

  it('leaves it open on a key that holds no secret yet', () => {
    expect(
      getAssigneeLock(
        row({ client_id: '', state: 'Creating', pending_action: 'create' }),
      ),
    ).toBeUndefined();
  });

  it('locks it on a paused key', () => {
    expect(getAssigneeLock(key({ state: 'Paused' }))).toBe(
      'Resume the key to change its assignee.',
    );
  });

  it('locks it while a command is in flight', () => {
    expect(
      getAssigneeLock(key({ state: 'Updating', pending_action: 'update' })),
    ).toBe('Wait for the current operation to finish.');
  });

  it('locks it on a key whose failed command is not a rotation', () => {
    expect(
      getAssigneeLock(key({ state: 'Erred', pending_action: 'pause' })),
    ).toBe('Retry the failed command first.');
  });

  // The rotation is retried with the new assignee.
  it('leaves it open on a key whose rotation failed', () => {
    expect(
      getAssigneeLock(key({ state: 'Erred', pending_action: 'rotate' })),
    ).toBeUndefined();
  });
});
