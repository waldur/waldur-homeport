import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import {
  PersonIdentifierFieldsRenderer,
  PersonIdentifierFieldConfig,
} from './PersonIdentifierFieldsRenderer';

const renderComponent = (fieldConfig: PersonIdentifierFieldConfig | null) =>
  render(
    <Form
      onSubmit={() => {}}
      render={() => (
        <PersonIdentifierFieldsRenderer fieldConfig={fieldConfig} />
      )}
    />,
  );

describe('PersonIdentifierFieldsRenderer', () => {
  it('renders nothing if fieldConfig is null', () => {
    const { container } = renderComponent(null);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders single string field', () => {
    const config: PersonIdentifierFieldConfig = {
      validation_method: 'EE',
      person_identifier_fields: {
        type: 'string',
        field: 'civil_number',
        label: 'Civil Number',
        description: 'Please enter your Estonian civil number',
        example: '38001010001',
      },
    };

    renderComponent(config);

    expect(screen.getByText('Personal identification required')).toBeDefined();
    expect(
      screen.getByText('Please enter your Estonian civil number'),
    ).toBeDefined();
    expect(screen.getByLabelText(/Civil Number/)).toBeDefined();
    expect(screen.getByPlaceholderText('38001010001')).toBeDefined();
  });

  it('renders multiple object fields', () => {
    const config: PersonIdentifierFieldConfig = {
      validation_method: 'AT',
      person_identifier_fields: {
        type: 'object',
        description: 'Please enter your personal data',
        fields: {
          first_name: {
            type: 'string',
            label: 'First Name',
            required: true,
          },
          last_name: {
            type: 'string',
            label: 'Last Name',
            required: true,
          },
          birth_date: {
            type: 'date',
            label: 'Birth Date',
            required: true,
          },
        },
      },
    };

    renderComponent(config);

    expect(screen.getByText('Personal identification required')).toBeDefined();
    expect(screen.getByText('Please enter your personal data')).toBeDefined();
    expect(screen.getByLabelText(/First Name/)).toBeDefined();
    expect(screen.getByLabelText(/Last Name/)).toBeDefined();
    expect(screen.getByLabelText(/Birth Date/)).toBeDefined();
  });

  it('shows loading spinner when loading is true', () => {
    render(
      <Form
        onSubmit={() => {}}
        render={() => (
          <PersonIdentifierFieldsRenderer fieldConfig={null} loading={true} />
        )}
      />,
    );
    expect(screen.getByRole('status')).toBeDefined();
  });
});
