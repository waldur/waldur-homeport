import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, it, expect, vi } from 'vitest';

import { FormContainerFinal } from './FormContainerFinal';

// Mock translation
vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

const TextInput = (props) => (
  <input
    {...props.input}
    id={props.id}
    placeholder={props.placeholder}
    disabled={props.disabled}
  />
);

const renderTestForm = (props: any = {}) => {
  return render(
    <Form
      onSubmit={props.onSubmit || vi.fn()}
      initialValues={props.initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit} data-testid="form">
          <FormContainerFinal
            submitting={props.submitting || submitting}
            space={props.space}
          >
            <TextInput
              name="name"
              label="Name"
              description={props.description}
              required={props.required}
            />
            <TextInput
              name="description"
              label="Description"
              required={props.required}
            />
          </FormContainerFinal>
          <button type="submit">Submit</button>
        </form>
      )}
    />,
  );
};

describe('FormContainerFinal', () => {
  describe('disable fields on submit', () => {
    it('enables all input fields by default', () => {
      renderTestForm({});
      expect(screen.getByLabelText('Name')).not.toBeDisabled();
      expect(screen.getByLabelText('Description')).not.toBeDisabled();
    });

    it('disables all input fields if form is submitting', () => {
      renderTestForm({ submitting: true });
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toBeDisabled();
      expect(inputs[1]).toBeDisabled();
    });
  });

  describe('required fields indication', () => {
    it('does not indicate required field by default', () => {
      const { container } = renderTestForm({});
      expect(container.querySelectorAll('.required').length).toBe(0);
    });

    it('indicates required field', () => {
      const { container } = renderTestForm({ required: true });
      // In FormGroupFinal, label has class 'required' if required prop is true
      expect(container.querySelectorAll('.required').length).toBe(2);
    });
  });

  describe('error rendering', () => {
    it('does not render errors by default', () => {
      const { container } = renderTestForm({});
      expect(container.querySelectorAll('.invalid-feedback').length).toBe(0);
    });

    it('renders errors for each field individually', async () => {
      const onSubmit = vi.fn().mockReturnValue({
        name: 'This field is required.',
        description: 'This field is too short.',
      });
      renderTestForm({ onSubmit });

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText('This field is required.')).toBeInTheDocument();
        expect(
          screen.getByText('This field is too short.'),
        ).toBeInTheDocument();
      });
    });
  });

  it('renders field description if provided', () => {
    const description = 'This name will be visible in accounting data.';
    renderTestForm({ description });
    expect(screen.getByText(description)).toBeInTheDocument();
  });
});
