import { UIRouterReact } from '@uirouter/react';
import { describe, expect, it } from 'vitest';

import { buildCallFilterParam, parseCallFilterParam } from './callFilterParam';

const call = { uuid: 'abc123', name: 'Call for 100% funded HPC access' };

// The url of the proposals-call-proposals state in routes.ts.
const matcher = new UIRouterReact().urlMatcherFactory.compile('/call/:call');

describe('call filter param', () => {
  it.each(['Call for 100% funded HPC access', 'Batch%20A', 'Tier 1/Tier 2'])(
    'reaches the component exactly as built: %s',
    (name) => {
      // UI-Router percent-encodes the param in format() and decodes it in
      // exec(), so the component is handed raw JSON. This is why the second
      // decode was wrong, and the reason parseCallFilterParam does none.
      const param = buildCallFilterParam({ uuid: 'abc123', name });
      const received = matcher.exec(matcher.format({ call: param })).call;

      expect(received).toBe(param);
      expect(parseCallFilterParam(received)).toEqual({ uuid: 'abc123', name });
    },
  );

  it('survives a percent sign in the call name', () => {
    // Used to throw "URI malformed": the param was decoded a second time, so
    // "% f" was read as an escape sequence.
    expect(parseCallFilterParam(buildCallFilterParam(call))).toEqual(call);
  });

  it('keeps an escape-looking sequence intact', () => {
    const batch = { uuid: 'abc123', name: 'Batch%20A' };
    // The quiet half of the same bug: this one decoded to 'Batch A'.
    expect(parseCallFilterParam(buildCallFilterParam(batch))?.name).toBe(
      'Batch%20A',
    );
  });

  it('carries only the fields the filter reads', () => {
    const param = buildCallFilterParam({
      uuid: 'abc123',
      name: 'Rolling access',
      description: 'x'.repeat(5000),
      offerings: [{ uuid: 'o1' }],
    } as any);

    expect(JSON.parse(param)).toEqual({
      uuid: 'abc123',
      name: 'Rolling access',
    });
  });

  it('falls back to no filter instead of throwing', () => {
    expect(parseCallFilterParam(undefined)).toBeUndefined();
    expect(parseCallFilterParam('')).toBeUndefined();
    // A link truncated in transit.
    expect(parseCallFilterParam('{"uuid":"abc123","na')).toBeUndefined();
  });

  it('rejects valid JSON that is not a call', () => {
    // Each of these parses and is truthy, so without a shape check it would
    // seed the filter with no uuid -- the table then drops the call scope and
    // lists every proposal the user can read, under an empty filter chip.
    expect(parseCallFilterParam('123')).toBeUndefined();
    expect(parseCallFilterParam('"abc123"')).toBeUndefined();
    expect(parseCallFilterParam('[]')).toBeUndefined();
    expect(parseCallFilterParam('true')).toBeUndefined();
    expect(parseCallFilterParam('null')).toBeUndefined();
    expect(parseCallFilterParam('{"name":"no uuid"}')).toBeUndefined();
  });

  it('still reads a param that carries a whole call', () => {
    // Links made before the param was trimmed.
    const legacy = JSON.stringify({
      uuid: 'abc123',
      name: 'Rolling access',
      description: 'Covers up to 80% of costs',
    });

    expect(parseCallFilterParam(legacy)).toMatchObject({
      uuid: 'abc123',
      name: 'Rolling access',
    });
  });
});
