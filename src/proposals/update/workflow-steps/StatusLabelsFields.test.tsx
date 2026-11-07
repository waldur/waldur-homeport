import { screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { STEP_KINDS } from '../../workflow/stepKinds.fixture';

import { StatusLabelsFields } from './StatusLabelsFields';
import { EMPTY_STEP_VALUES, StepFormValues } from './stepForm';

const decision = STEP_KINDS.find((k) => k.id === 'decision')!;

const renderFields = (values: Partial<StepFormValues>) => {
  const all = { ...EMPTY_STEP_VALUES, outcome_set: 'eligibility', ...values };
  return renderWithProviders(
    <Form
      onSubmit={() => undefined}
      initialValues={all}
      render={() => (
        <StatusLabelsFields kind={decision} values={all as StepFormValues} />
      )}
    />,
  );
};

describe('StatusLabelsFields', () => {
  it('asks for applicant labels on a step visible to applicants', () => {
    renderFields({ applicant_visible: true, allows_change_requests: true });
    expect(screen.getByTestId('status-labels-applicant')).toBeInTheDocument();
    expect(screen.getByTestId('status-labels-evaluators')).toBeInTheDocument();
    expect(
      screen.getAllByText('While changes are requested').length,
    ).toBeGreaterThan(0);
  });

  it('explains why a hidden step has no applicant labels', () => {
    renderFields({ applicant_visible: false });
    expect(
      screen.queryByTestId('status-labels-applicant'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('status-labels-applicant-hidden'),
    ).toBeInTheDocument();
    expect(screen.queryByText('While changes are requested')).toBeNull();
  });

  it('asks for the call team and offering team labels too', () => {
    renderFields({ applicant_visible: false });
    expect(screen.getByTestId('status-labels-call_team')).toBeInTheDocument();
    expect(
      screen.getByTestId('status-labels-offering_team'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('status-labels-counts')).toHaveTextContent(
      '{submitted}',
    );
  });

  it('asks for applicant labels on the decision of an extension request', () => {
    renderFields({
      applicant_visible: false,
      phase: 'extension',
      outcome_set: 'approval',
    });
    expect(screen.getByTestId('status-labels-applicant')).toBeInTheDocument();
  });
});
