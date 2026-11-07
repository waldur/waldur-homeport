import { screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ProjectDetailsStep } from './ProjectDetailsStep';

// The upload block talks to the API and the dropzone; the counter does not.
vi.mock('./UploadDocumentationFiles', () => ({
  UploadDocumentationFiles: () => null,
}));

const fieldConfig = {
  field_project_summary: 'required',
  field_description: 'optional',
  field_science_sub_domain: 'hidden',
  field_supporting_documentation: 'hidden',
};

const renderStep = ({
  proposal = {},
  values = {},
  config = {},
}: { proposal?: any; values?: any; config?: any } = {}) =>
  renderWithProviders(
    <Form onSubmit={() => undefined} initialValues={values}>
      {() => (
        <ProjectDetailsStep
          {...({
            id: 'project-details',
            params: {
              isOpen: true,
              proposal,
              values,
              call: { proposal_field_config: { ...fieldConfig, ...config } },
            },
          } as any)}
        />
      )}
    </Form>,
  );

describe('ProjectDetailsStep', () => {
  it.each([
    ['Name', 150, true],
    ['Summary', 1000, false],
    ['Description', 4096, false],
  ])(
    'limits %s to the backend length and shows it up front',
    (label, max, cutsInput) => {
      renderStep();
      const control = screen.getByRole('textbox', { name: label });
      // The textareas refuse an overlong value through their validator
      // rather than cutting a paste at the native maxlength.
      if (cutsInput) {
        expect(control).toHaveAttribute('maxLength', String(max));
      } else {
        expect(control).not.toHaveAttribute('maxLength');
      }
      expect(control).toHaveAccessibleDescription(
        `0 of ${max} characters used`,
      );
      expect(screen.getByText(`0 / ${max}`)).toBeInTheDocument();
    },
  );

  it('counts a document already on the proposal as filled', () => {
    // Save as draft uploads the files and clears them from the form; the
    // step must still count them, or it can never reach its total.
    renderStep({
      config: { field_supporting_documentation: 'required' },
      values: { name: 'P' },
      proposal: {
        supporting_documentation: [
          { uuid: 'd1', file_name: 'cv.pdf', file_size: 1 },
        ],
      },
    });
    expect(screen.getByText('2/4 fields filled')).toBeInTheDocument();
  });

  it('does not count documents the proposal no longer has', () => {
    renderStep({
      config: { field_supporting_documentation: 'required' },
      values: { name: 'P' },
      proposal: { supporting_documentation: [] },
    });
    expect(screen.getByText('1/4 fields filled')).toBeInTheDocument();
  });
});
