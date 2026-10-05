import { describe, expect, it } from 'vitest';

import { assignColorSlots, OTHER_GROUP, splitSeries } from './splitSeries';

const series = (name: string, values: [string, number][]) => ({
  attributes: { user: name },
  points: values.map(([day, value]) => ({
    timestamp: `${day}T00:00:00+00:00`,
    value,
  })),
});

const INPUT = [
  series('alice', [
    ['2026-10-01', 5],
    ['2026-10-02', 5],
  ]),
  series('bob', [['2026-10-01', 7]]),
  series('carol', [['2026-10-02', 1]]),
  series('dave', [['2026-10-01', 2]]),
];

describe('splitSeries', () => {
  it('keeps the largest groups and folds the rest into Other', () => {
    const groups = splitSeries(INPUT, 'user', true, 2);

    expect(groups.map((g) => g.key)).toEqual(['alice', 'bob', OTHER_GROUP]);
    const other = groups[2].byDay;
    expect(Object.fromEntries(other)).toEqual({
      '2026-10-01': 2,
      '2026-10-02': 1,
    });
  });

  it('leaves the rest out when values cannot be added up', () => {
    const groups = splitSeries(INPUT, 'user', false, 2);

    expect(groups.map((g) => g.key)).toEqual(['alice', 'bob']);
  });

  it('names a missing attribute value', () => {
    const groups = splitSeries(
      [
        {
          attributes: {},
          points: [{ timestamp: '2026-10-01T00:00:00Z', value: 3 }],
        },
      ],
      'user',
      true,
    );

    expect(groups[0].key).toBe('—');
  });

  it('keeps gaps as gaps', () => {
    const [alice] = splitSeries(
      [
        {
          attributes: { user: 'alice' },
          points: [{ timestamp: '2026-10-01T00:00:00Z', value: null }],
        },
      ],
      'user',
      true,
    );

    expect(alice.byDay.size).toBe(0);
  });
});

describe('assignColorSlots', () => {
  it('gives a key the same slot whichever card it is on', () => {
    const first = assignColorSlots(['alice', 'bob']);
    const second = assignColorSlots(['zoe', 'alice']);

    expect(second.get('alice')).toBe(first.get('alice'));
  });

  it('never gives two keys of one card the same slot', () => {
    const keys = ['a', 'b', 'c', 'd', 'e', 'f'];
    const slots = assignColorSlots(keys, 8);

    expect(new Set(slots.values()).size).toBe(keys.length);
  });

  it('leaves Other to the neutral colour', () => {
    expect(assignColorSlots(['alice', OTHER_GROUP]).has(OTHER_GROUP)).toBe(
      false,
    );
  });
});
