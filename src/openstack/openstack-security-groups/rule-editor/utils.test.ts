import { describe, expect, it } from 'vitest';

import { isNumericProtocol } from './ProtocolField';
import { SecurityGroupRulesFormData } from './types';
import { serializeRulesPayload } from './utils';

describe('isNumericProtocol', () => {
  it.each(['0', '1', '6', '112', '255'])(
    'accepts numeric IANA protocol "%s"',
    (value) => {
      expect(isNumericProtocol(value)).toBe(true);
    },
  );

  it.each(['', 'tcp', 'udp', 'icmp', '256', '-1', '12a', 'abc', '1.5'])(
    'rejects non-numeric or out-of-range "%s"',
    (value) => {
      expect(isNumericProtocol(value)).toBe(false);
    },
  );
});

describe('serializeRulesPayload', () => {
  const buildForm = (overrides: Partial<{ protocol: string }>) =>
    ({
      rules: [
        {
          ethertype: 'IPv4',
          direction: 'ingress',
          protocol: 'tcp',
          port_range: { min: 80, max: 80 },
          cidr: '0.0.0.0/0',
          ...overrides,
        },
      ],
    }) as SecurityGroupRulesFormData;

  it('keeps port range for tcp', () => {
    const [rule] = serializeRulesPayload(buildForm({ protocol: 'tcp' }));
    expect(rule.protocol).toBe('tcp');
    expect(rule.from_port).toBe(80);
    expect(rule.to_port).toBe(80);
  });

  it('converts "any" to empty protocol with sentinel ports', () => {
    const [rule] = serializeRulesPayload(buildForm({ protocol: 'any' }));
    expect(rule.protocol).toBe('');
    expect(rule.from_port).toBe(-1);
    expect(rule.to_port).toBe(-1);
  });

  it('keeps numeric protocol and forces sentinel ports', () => {
    const [rule] = serializeRulesPayload(buildForm({ protocol: '112' }));
    expect(rule.protocol).toBe('112');
    expect(rule.from_port).toBe(-1);
    expect(rule.to_port).toBe(-1);
  });
});
