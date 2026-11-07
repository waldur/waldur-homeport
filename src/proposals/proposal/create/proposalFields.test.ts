import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import {
  asksForDuration,
  getFieldStates,
  getRequiredFields,
  getTrackedFields,
  isFieldRequired,
  isFieldVisible,
  isProposalFieldFilled,
  shouldRenderField,
} from './proposalFields';

const setAccessMode = (mode?: string) => {
  (ENV as any).plugins = {
    ...(ENV as any).plugins,
    WALDUR_CORE: {
      ...(ENV as any).plugins?.WALDUR_CORE,
      SERVICE_ACCESS_MODE: mode,
    },
  };
};

const setScienceDomains = (enabled?: boolean) => {
  (ENV as any).FEATURES = {
    ...(ENV as any).FEATURES,
    project: { ...(ENV as any).FEATURES?.project, science_domain: enabled },
  };
};

describe('proposal field states', () => {
  // A deployment with science domains, so the science domain follows only the
  // call; the cases without them are below.
  beforeEach(() => setScienceDomains(true));
  // Every other case in here wants the call-managed default rather than
  // whatever access mode ran last.
  afterEach(() => {
    setAccessMode(undefined);
    setScienceDomains(undefined);
  });

  it('falls back to the pre-configuration behaviour', () => {
    // Matters for calls created before the feature, and for the moment before
    // the call request resolves: the form must still render.
    const states = getFieldStates(undefined);

    expect(states.project_summary).toBe('required');
    expect(states.description).toBe('optional');
    expect(states.science_sub_domain).toBe('optional');
    expect(states.supporting_documentation).toBe('optional');
  });

  it('reads what the call configured', () => {
    const states = getFieldStates({
      field_project_summary: 'optional',
      field_description: 'hidden',
    });

    expect(states.project_summary).toBe('optional');
    expect(states.description).toBe('hidden');
    // Unspecified keys keep the default rather than becoming undefined.
    expect(states.science_sub_domain).toBe('optional');
  });

  it('treats a hidden field as neither visible nor required', () => {
    const states = getFieldStates({ field_description: 'hidden' });

    expect(isFieldVisible(states, 'description')).toBe(false);
    expect(isFieldRequired(states, 'description')).toBe(false);
  });

  it('always keeps the name required', () => {
    const states = getFieldStates({
      field_project_summary: 'hidden',
      field_description: 'hidden',
      field_science_sub_domain: 'hidden',
      field_supporting_documentation: 'hidden',
    });

    expect(getRequiredFields(states)).toEqual(['name']);
  });

  it('tracks only the fields the call asks for', () => {
    // A hidden field left in the tracked list would leave the step's
    // "{filled}/{total} fields filled" counter permanently short of its total.
    const states = getFieldStates({
      field_description: 'hidden',
      field_supporting_documentation: 'hidden',
    });

    expect(getTrackedFields(states)).toEqual([
      'name',
      'project_summary',
      'science_sub_domain',
    ]);
  });

  it('counts a stored document as a filled field', () => {
    // After Save as draft the files live on the proposal, not in the form.
    expect(
      isProposalFieldFilled(
        'supporting_documentation',
        {},
        { supporting_documentation: [{ uuid: 'd1' }] },
      ),
    ).toBe(true);
    expect(
      isProposalFieldFilled(
        'supporting_documentation',
        {},
        {
          supporting_documentation: [],
        },
      ),
    ).toBe(false);
    expect(isProposalFieldFilled('supporting_documentation', {})).toBe(false);
  });

  it('counts a file picked but not yet uploaded', () => {
    expect(
      isProposalFieldFilled('supporting_documentation', {
        supporting_documentation: [{ name: 'cv.pdf' }],
      }),
    ).toBe(true);
  });

  it('judges the other fields by their form value', () => {
    expect(isProposalFieldFilled('name', { name: 'P' })).toBe(true);
    expect(isProposalFieldFilled('name', { name: '' })).toBe(false);
    expect(isProposalFieldFilled('name', undefined)).toBe(false);
    expect(isProposalFieldFilled('science_sub_domain', {})).toBe(false);
    expect(
      isProposalFieldFilled('science_sub_domain', {
        science_sub_domain: { uuid: 's1' },
      }),
    ).toBe(true);
    expect(
      isProposalFieldFilled('science_sub_domain', { science_sub_domain: {} }),
    ).toBe(false);
  });

  it('never asks for the project duration, in any access mode', () => {
    // Allocation derives the length from the subscriptions requested and the
    // call's fixed duration; a field listed here would leave the step short of
    // a total the applicant cannot fill.
    for (const mode of ['both', 'calls', 'marketplace', undefined]) {
      setAccessMode(mode);
      const states = getFieldStates(undefined);

      expect(getTrackedFields(states)).not.toContain('duration_in_days');
      expect(getRequiredFields(states)).toEqual(['name', 'project_summary']);
    }
  });

  it('asks for the duration where the call offers a list of lengths', () => {
    const states = getFieldStates(undefined);

    expect(asksForDuration({ allowed_duration_months: [3, 6] })).toBe(true);
    expect(asksForDuration({ allowed_duration_months: [] })).toBe(false);
    expect(asksForDuration(undefined)).toBe(false);
    expect(getTrackedFields(states, true)).toContain(
      'requested_duration_months',
    );
    expect(getRequiredFields(states, true)).toEqual([
      'name',
      'project_summary',
      'requested_duration_months',
    ]);
  });

  it('promotes a configured field into the required set', () => {
    // project_summary is required by default, so it stays alongside.
    const states = getFieldStates({ field_science_sub_domain: 'required' });

    expect(getRequiredFields(states)).toEqual([
      'name',
      'project_summary',
      'science_sub_domain',
    ]);
  });
});

// waldur/waldur-homeport#131 on GitHub: a call requiring a science domain on a
// deployment without the project feature counted a field it never showed.
describe('science domain without the project.science_domain feature', () => {
  it('asks for one the call requires', () => {
    const states = getFieldStates(
      { field_science_sub_domain: 'required' },
      false,
    );

    expect(isFieldVisible(states, 'science_sub_domain')).toBe(true);
    expect(getRequiredFields(states)).toContain('science_sub_domain');
  });

  it('neither shows nor counts one the call merely offers', () => {
    // Optional is the default, so this is every call that never set it.
    const states = getFieldStates(undefined, false);

    expect(isFieldVisible(states, 'science_sub_domain')).toBe(false);
    expect(getTrackedFields(states)).not.toContain('science_sub_domain');
  });

  it('keeps one the call hides hidden', () => {
    const states = getFieldStates(
      { field_science_sub_domain: 'hidden' },
      false,
    );

    expect(isFieldVisible(states, 'science_sub_domain')).toBe(false);
  });
});

describe('shouldRenderField', () => {
  it('renders a field the call asks for, even when empty', () => {
    const states = getFieldStates({ field_description: 'optional' });

    expect(shouldRenderField(states, 'description', '')).toBe(true);
  });

  it('skips a hidden field the proposal never filled in', () => {
    const states = getFieldStates({ field_description: 'hidden' });

    expect(shouldRenderField(states, 'description', '')).toBe(false);
    expect(shouldRenderField(states, 'description', null)).toBe(false);
  });

  it('keeps a hidden field that an older proposal already answered', () => {
    // The call dropped the question after this proposal was written; reviewers
    // still need to see what was submitted.
    const states = getFieldStates({ field_description: 'hidden' });

    expect(shouldRenderField(states, 'description', 'Legacy answer')).toBe(
      true,
    );
  });

  it('treats an empty list as no value', () => {
    const states = getFieldStates({ field_supporting_documentation: 'hidden' });

    expect(shouldRenderField(states, 'supporting_documentation', [])).toBe(
      false,
    );
    expect(
      shouldRenderField(states, 'supporting_documentation', [{ uuid: 'x' }]),
    ).toBe(true);
  });
});
