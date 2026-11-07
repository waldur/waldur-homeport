import { screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalComplianceStepExpanded } from './ProposalComplianceStepExpanded';

const question = (uuid: string, required: boolean) => ({
  uuid,
  description: `Question ${uuid}`,
  question_type: 'text_input',
  required,
  dependencies_info: null,
});

const render = (questions, values) => {
  vi.mocked(sdk.proposalProposalsChecklistRetrieve).mockResolvedValue({
    data: { questions },
  } as any);
  renderWithProviders(
    <Form
      onSubmit={vi.fn()}
      initialValues={values}
      render={() => (
        <ProposalComplianceStepExpanded
          id="step-compliance"
          params={{ proposal: { uuid: 'p1' }, values, isOpen: false }}
        />
      )}
    />,
  );
};

describe('the compliance checklist header', () => {
  beforeEach(() => vi.clearAllMocks());

  it('counts the required questions, which submitting needs', async () => {
    // Every required question answered, an optional one not: nothing is
    // missing, and the header must not read as if something were.
    render([question('a', true), question('b', true), question('c', false)], {
      compliance_a: 'yes',
      compliance_b: 'yes',
    });
    expect(
      await screen.findByText('2/2 required answered'),
    ).toBeInTheDocument();
  });

  it('counts every question when none is required', async () => {
    render([question('a', false), question('b', false)], {
      compliance_a: 'yes',
    });
    expect(await screen.findByText('1/2 answered')).toBeInTheDocument();
  });
});
