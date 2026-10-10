import { describe, expect, it } from 'vitest';

import { makeCallMemberStateKey, timerDelay } from './callMembership';

describe('makeCallMemberStateKey', () => {
  it('uses the MSC4143 per-device layout matrix-js-sdk writes', () => {
    expect(makeCallMemberStateKey('@alice:example.org', 'DEV1')).toBe(
      '_@alice:example.org_DEV1_m.call',
    );
  });

  it('drops the leading underscore in rooms with owned state keys', () => {
    expect(
      makeCallMemberStateKey(
        '@alice:example.org',
        'DEV1',
        'org.matrix.msc3757.11',
      ),
    ).toBe('@alice:example.org_DEV1_m.call');
  });

  it('gives two devices of one user different keys', () => {
    expect(makeCallMemberStateKey('@a:s', 'DEV1')).not.toBe(
      makeCallMemberStateKey('@a:s', 'DEV2'),
    );
  });
});

describe('timerDelay', () => {
  it('never returns a delay that would make setTimeout fire at once', () => {
    expect(timerDelay(NaN)).toBe(2 ** 31 - 1);
    expect(timerDelay(Infinity)).toBe(2 ** 31 - 1);
    expect(timerDelay(-Infinity)).toBe(2 ** 31 - 1);
    expect(timerDelay(1e12)).toBe(2 ** 31 - 1);
    expect(timerDelay(-50)).toBe(1000);
    expect(timerDelay(0)).toBe(1000);
    expect(timerDelay(60_000)).toBe(60_000);
  });
});
