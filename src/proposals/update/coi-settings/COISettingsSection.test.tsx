import { describe, expect, it } from 'vitest';

import {
  COI_TYPE_OPTIONS,
  getAvailableTypeOptions,
} from './COISettingsSection';

const valuesOf = (
  options: ReturnType<typeof getAvailableTypeOptions>,
): string[] => options.map((opt) => opt.value);

describe('getAvailableTypeOptions', () => {
  it('offers every type when nothing is assigned yet', () => {
    expect(
      valuesOf(getAvailableTypeOptions(undefined, 'recusal_required_types')),
    ).toEqual(valuesOf(COI_TYPE_OPTIONS));

    expect(
      valuesOf(getAvailableTypeOptions({} as any, 'recusal_required_types')),
    ).toEqual(valuesOf(COI_TYPE_OPTIONS));
  });

  it('excludes types claimed by the other rules', () => {
    const config = {
      management_allowed_types: ['COAUTH_RECENT'],
      disclosure_only_types: ['SOC_MEMBER'],
    } as any;

    const available = valuesOf(
      getAvailableTypeOptions(config, 'recusal_required_types'),
    );

    expect(available).not.toContain('COAUTH_RECENT');
    expect(available).not.toContain('SOC_MEMBER');
    // Untouched types stay selectable.
    expect(available).toContain('INST_SAME');
    expect(available).toHaveLength(COI_TYPE_OPTIONS.length - 2);
  });

  // Only bites when a type is claimed by two rules at once, which pre-existing
  // rows may still contain. Drop the "own selection" clause and the value
  // renders blank in its selector, leaving the user unable to clear it.
  it("keeps a field's own selection visible when another rule also claims it", () => {
    const config = {
      recusal_required_types: ['INST_SAME'],
      management_allowed_types: ['INST_SAME'],
    } as any;

    expect(
      valuesOf(getAvailableTypeOptions(config, 'recusal_required_types')),
    ).toContain('INST_SAME');
    expect(
      valuesOf(getAvailableTypeOptions(config, 'management_allowed_types')),
    ).toContain('INST_SAME');
    // The rule that does not own it still has it hidden.
    expect(
      valuesOf(getAvailableTypeOptions(config, 'disclosure_only_types')),
    ).not.toContain('INST_SAME');
  });

  it('applies the same rule from each of the three fields', () => {
    const config = {
      recusal_required_types: ['INST_SAME'],
      management_allowed_types: ['COAUTH_RECENT'],
      disclosure_only_types: ['SOC_MEMBER'],
    } as any;

    const recusal = valuesOf(
      getAvailableTypeOptions(config, 'recusal_required_types'),
    );
    expect(recusal).toContain('INST_SAME');
    expect(recusal).not.toContain('COAUTH_RECENT');
    expect(recusal).not.toContain('SOC_MEMBER');

    const management = valuesOf(
      getAvailableTypeOptions(config, 'management_allowed_types'),
    );
    expect(management).toContain('COAUTH_RECENT');
    expect(management).not.toContain('INST_SAME');
    expect(management).not.toContain('SOC_MEMBER');

    const disclosure = valuesOf(
      getAvailableTypeOptions(config, 'disclosure_only_types'),
    );
    expect(disclosure).toContain('SOC_MEMBER');
    expect(disclosure).not.toContain('INST_SAME');
    expect(disclosure).not.toContain('COAUTH_RECENT');
  });

  it('preserves the declared option order', () => {
    const config = { management_allowed_types: ['FIN_DIRECT'] } as any;

    const available = valuesOf(
      getAvailableTypeOptions(config, 'recusal_required_types'),
    );

    expect(available).toEqual(
      valuesOf(COI_TYPE_OPTIONS).filter((value) => value !== 'FIN_DIRECT'),
    );
  });
});
