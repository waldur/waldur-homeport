import { describe, expect, it } from 'vitest';

import {
  getErredTooltip,
  getFailedCommand,
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
