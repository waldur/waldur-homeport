import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField, FormLabel, Input } from 'waldur-ui';

import { FormGroup } from './FormGroup';

describe('FormGroup', () => {
  it('does not repeat one id across the controls it holds', () => {
    render(
      <FormGroup label="Range" input={{ name: 'range' }}>
        <Input data-testid="from" />
        <Input data-testid="to" />
      </FormGroup>,
    );
    const from = screen.getByTestId('from').id;
    const to = screen.getByTestId('to').id;
    expect(from).not.toBe('');
    expect(to).not.toBe('');
    expect(from).not.toBe(to);
    // The label names the first of them.
    expect(screen.getByLabelText('Range')).toBe(screen.getByTestId('from'));
  });

  it('gives a control the id it was asked for', () => {
    render(
      <FormGroup label="Name" controlId="given-id">
        <Input />
      </FormGroup>,
    );
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'given-id');
  });

  it('does not take the field name as the id', () => {
    render(
      <FormGroup label="Name" input={{ name: 'name' }}>
        <Input />
      </FormGroup>,
    );
    expect(screen.getByLabelText('Name').id).not.toBe('name');
  });

  describe('group', () => {
    it('is a fieldset named by the label, with each control named on its own', () => {
      render(
        <FormGroup group label="Business hours" description="Daily range">
          <FormField>
            <FormLabel>From</FormLabel>
            <Input />
          </FormField>
          <FormField>
            <FormLabel>Till</FormLabel>
            <Input />
          </FormField>
        </FormGroup>,
      );
      const group = screen.getByRole('group', { name: 'Business hours' });
      expect(group).toHaveAccessibleDescription('Daily range');
      expect(screen.getByLabelText('From')).not.toBe(
        screen.getByLabelText('Till'),
      );
      // The description belongs to the group, not to either control.
      expect(screen.getByLabelText('From')).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it('does not point its label at the first control', () => {
      render(
        <FormGroup group label="Range">
          <Input aria-label="Low" />
          <Input aria-label="High" />
        </FormGroup>,
      );
      expect(screen.queryByLabelText('Range')).toBeNull();
    });
  });
});
