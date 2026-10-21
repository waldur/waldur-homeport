import { describe, expect, it } from 'vitest';

import {
  getAssigneeLock,
  getErredTooltip,
  getFailedCommand,
  getKeyStateVariant,
  getResourcePause,
  getStateLabel,
  getStateTooltip,
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

describe('getErredTooltip', () => {
  it('names the failed command and the error', () => {
    expect(
      getErredTooltip(
        row({ pending_action: 'pause', error_message: 'gateway down' }),
      ),
    ).toBe('Pause failed: gateway down');
  });
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

describe('a key on a paused resource', () => {
  const ok = row({ state: 'OK' });

  // Its own state is OK, but nothing serves it until the resource resumes.
  it('reads as blocked, not OK', () => {
    expect(getStateLabel(ok, 'limit')).toBe('Blocked: resource paused');
    expect(getKeyStateVariant(ok, 'limit').variant).toBe('warning');
    expect(getStateTooltip(ok, 'limit')).toMatch(/usage reached its limit/);
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
