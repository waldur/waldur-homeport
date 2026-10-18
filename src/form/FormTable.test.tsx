import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from 'waldur-ui';

import FormTable from './FormTable';

describe('FormTable.Item', () => {
  it('links its label to the control in its value, with no htmlFor', () => {
    render(
      <FormTable>
        <FormTable.Item label="Backend ID" value={<Input />} />
      </FormTable>,
    );
    expect(screen.getByLabelText('Backend ID').tagName).toBe('INPUT');
  });

  it('links the label of a described row too', () => {
    render(
      <FormTable>
        <FormTable.Item
          label="Retention"
          description="Days to keep"
          value={<Input />}
        />
      </FormTable>,
    );
    expect(screen.getByLabelText('Retention').tagName).toBe('INPUT');
  });

  it('keeps one scope per row', () => {
    render(
      <FormTable>
        <FormTable.Item label="First" value={<Input />} />
        <FormTable.Item label="Second" value={<Input />} />
      </FormTable>,
    );
    const first = screen.getByLabelText('First');
    const second = screen.getByLabelText('Second');
    expect(first).not.toBe(second);
    expect(first.id).not.toBe(second.id);
  });

  it('leaves a read-only row alone', () => {
    render(
      <FormTable>
        <FormTable.Item label="Name" value="Alpha" />
      </FormTable>,
    );
    expect(screen.getByText('Name')).not.toHaveAttribute('for');
  });
});
