import { describe, expect, it } from 'vitest';

import { canViewTechnicalAssessment } from './technicalAssessmentAccess';

const proposal = { call_uuid: 'call-1', created_by_uuid: 'applicant-1' };

const step = (overrides = {}) =>
  ({
    step: 'technical_assessment',
    status: 'active',
    applicant_visible: false,
    checklist_status: { has_checklist: true },
    ...overrides,
  }) as any;

const resourceRows = [
  {
    requested_offering: { offering_uuid: 'offering-1', state: 'accepted' },
  },
  {
    requested_offering: { offering_uuid: 'offering-2', state: 'requested' },
  },
] as any;

const user = (overrides = {}) =>
  ({
    uuid: 'user-1',
    is_staff: false,
    is_support: false,
    permissions: [],
    ...overrides,
  }) as any;

const role = (role_name: string, scope_uuid: string) => ({
  role_name,
  scope_uuid,
});

const check = (viewer, states = [step()]) =>
  canViewTechnicalAssessment({
    user: viewer,
    proposal,
    workflowStates: states,
    resourceRows,
  });

describe('canViewTechnicalAssessment', () => {
  it('lets staff and the call managers read the assessments', () => {
    expect(check(user({ is_staff: true }))).toBe(true);
    expect(check(user({ permissions: [role('CALL.MANAGER', 'call-1')] }))).toBe(
      true,
    );
  });

  it('lets the manager of an accepted requested offering read them', () => {
    expect(
      check(user({ permissions: [role('OFFERING.MANAGER', 'offering-1')] })),
    ).toBe(true);
    // An offering the call has not accepted brings its manager no access.
    expect(
      check(user({ permissions: [role('OFFERING.MANAGER', 'offering-2')] })),
    ).toBe(false);
  });

  it('does not let a reviewer, panel member or support read them', () => {
    expect(
      check(user({ permissions: [role('CALL.REVIEWER', 'call-1')] })),
    ).toBe(false);
    expect(
      check(user({ permissions: [role('CALL.PANEL_MEMBER', 'call-1')] })),
    ).toBe(false);
    expect(check(user({ is_support: true }))).toBe(false);
    // A manager of another call is not a manager of this one.
    expect(check(user({ permissions: [role('CALL.MANAGER', 'call-2')] }))).toBe(
      false,
    );
  });

  it('lets the applicant read them only when the step is shown to them', () => {
    const applicant = user({ uuid: 'applicant-1' });
    expect(check(applicant)).toBe(false);
    expect(check(applicant, [step({ applicant_visible: true })])).toBe(true);
  });

  it('asks nobody when the call has no technical assessment checklist', () => {
    const staff = user({ is_staff: true });
    expect(check(staff, [])).toBe(false);
    expect(check(staff, [step({ checklist_status: null })])).toBe(false);
    expect(
      canViewTechnicalAssessment({
        user: staff,
        proposal,
        workflowStates: undefined,
        resourceRows,
      }),
    ).toBe(false);
  });

  it('does not take a concealed creator for the viewer', () => {
    const anonymous = user({ uuid: undefined });
    expect(
      canViewTechnicalAssessment({
        user: anonymous,
        proposal: { call_uuid: 'call-1', created_by_uuid: undefined },
        workflowStates: [step({ applicant_visible: true })],
        resourceRows,
      }),
    ).toBe(false);
  });
});
