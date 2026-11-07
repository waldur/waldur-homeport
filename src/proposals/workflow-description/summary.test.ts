import { describe, expect, it } from 'vitest';
import { ProposalWorkflowStepInstance } from 'waldur-js-client';

import { getApplicantTimeline } from '@/proposals/proposal/applicantTimeline';

import fixture from './applicantLabels.fixture.json';
import { DESCRIPTION } from './description.fixture';
import {
  notificationMatrixExportFields,
  notificationMatrixExportRows,
  notificationMatrixRows,
  roleMatrixExportFields,
  roleMatrixExportRows,
} from './matrixExport';
import {
  applicantLabelKind,
  applicantLabelText,
  conditionText,
  formatStepSummary,
  fromDescription,
} from './summary';

const described = (key: string) =>
  fromDescription(
    DESCRIPTION.steps.find((step) => step.key === key)!,
    DESCRIPTION,
  );

describe('applicant labels', () => {
  // The backend's description derives the same labels from the same cases
  // (waldur-mastermind proposal/tests/applicant_labels.json).
  it.each(fixture.cases)(
    '$label for $step.name',
    ({ step, label_kind, label }) => {
      expect(applicantLabelKind(step)).toBe(label_kind);
      expect(
        applicantLabelText(
          label_kind,
          step.name,
          step.status_labels?.applicant?.active,
        ),
      ).toBe(label);
    },
  );

  it.each(fixture.cases)(
    "matches the applicant's tracker for $step.name",
    ({ step, label_kind, label }) => {
      const [shown] = getApplicantTimeline([
        {
          uuid: 'step',
          step: 'step',
          step_name: step.name,
          status: 'active',
          stage: 0,
          ...step,
          // What the backend sends the applicant for the step while active.
          status_label: label_kind === 'configured' ? label : null,
        } as unknown as ProposalWorkflowStepInstance,
      ]);
      expect(shown.status_label ?? shown.step_name).toBe(label);
    },
  );
});

describe('step summary', () => {
  it('says who completes a lead-only step and what it reads', () => {
    const sentence = formatStepSummary(described('report'));
    expect(sentence).toMatch(
      /^Consolidated report: completed by the lead Rapporteur/,
    );
    expect(sentence).toContain('reads Technical assessment');
    expect(sentence).toContain(
      "hidden from applicants (they see 'Internal check')",
    );
    expect(sentence).toContain('its report can be released to the applicant');
    expect(sentence).toContain('emails the lead Rapporteur when it starts');
  });

  it('names the steps of a parallel stage and delegation', () => {
    const sentence = formatStepSummary(described('technical'));
    expect(sentence).toContain('runs alongside Rapporteur assignment');
    expect(sentence).toContain(
      "slots can be handed on within the offering's team",
    );
    expect(sentence).toContain('due 21 days after it starts');
    expect(formatStepSummary(described('assignment'))).toContain(
      'assigns Rapporteur',
    );
  });

  it('marks a disabled step', () => {
    expect(
      formatStepSummary({ ...described('assignment'), enabled: false }),
    ).toMatch(/Disabled: proposals skip it\.$/);
  });
});

describe('role matrix export', () => {
  it('has one row per step and role', () => {
    const data = roleMatrixExportRows(DESCRIPTION.steps, DESCRIPTION);
    expect(roleMatrixExportFields()).toHaveLength(10);
    expect(data).toHaveLength(
      DESCRIPTION.steps.length * DESCRIPTION.actors.length,
    );
    const applicantReport = data.find(
      (row) => row[0] === 'Consolidated report' && row[2] === 'Applicant',
    )!;
    expect(applicantReport[4]).toBe('Yes');
    expect(applicantReport[9]).toBe('Internal check');
  });

  it('keeps to the roles shown', () => {
    const data = roleMatrixExportRows(DESCRIPTION.steps, DESCRIPTION, [
      'applicant',
    ]);
    expect(data).toHaveLength(DESCRIPTION.steps.length);
    expect(new Set(data.map((row) => row[2]))).toEqual(new Set(['Applicant']));
  });
});

describe('notification matrix export', () => {
  const rules = DESCRIPTION.steps.flatMap((step) => step.notifications);
  const exportOf = (description = DESCRIPTION, hideDisabled = false) =>
    notificationMatrixExportRows(
      notificationMatrixRows(description, hideDisabled),
    );

  it('has one row per notification rule', () => {
    const data = exportOf();
    expect(notificationMatrixExportFields()).toHaveLength(8);
    expect(rules.length).toBeGreaterThan(0);
    expect(data).toHaveLength(rules.length);
    expect(data.filter((row) => row[5] === 'Yes')).toHaveLength(
      rules.filter((rule) => rule.enabled).length,
    );
  });

  it("leaves out a disabled step's rules only when asked to", () => {
    const description = {
      ...DESCRIPTION,
      steps: DESCRIPTION.steps.map((step) =>
        step.notifications.length ? { ...step, enabled: false } : step,
      ),
    };
    expect(exportOf(description)).toHaveLength(rules.length);
    expect(exportOf(description, true)).toHaveLength(0);
  });
});

describe('run conditions in a few words', () => {
  it('names the outcomes, or how far apart the scores must lie', () => {
    expect(
      conditionText({ stepName: 'Technical', outcomes: ['feasible'] }),
    ).toBe('Technical = Feasible');
    expect(
      conditionText({
        stepName: 'Expert evaluation',
        outcomes: [],
        scoreSpreadAbove: 1,
      }),
    ).toBe('Expert evaluation scores differ by more than 1');
  });
});
