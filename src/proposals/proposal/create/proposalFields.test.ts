import { afterEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import {
  getFieldStates,
  getRequiredFields,
  getTrackedFields,
  isFieldRequired,
  isFieldVisible,
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

describe('proposal field states', () => {
  // Every other case in here wants the call-managed default rather than
  // whatever access mode ran last.
  afterEach(() => setAccessMode(undefined));

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
