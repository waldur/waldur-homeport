import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Resource } from 'waldur-js-client';

import { ResourceTerminationDateField } from './ResourceTerminationDateField';

const renderField = (row: Partial<Resource>) =>
  render(<ResourceTerminationDateField row={row as Resource} />);

describe('ResourceTerminationDateField', () => {
  it('formats the date like the other date columns', () => {
    const { container } = renderField({
      resource_effective_end_date: '2027-06-01',
    });

    expect(container.textContent).toBe('1 Jun 2027');
  });

  it('warns when the project ends before the requested termination date', () => {
    const { container } = renderField({
      end_date: '2027-09-01',
      resource_effective_end_date: '2027-06-01',
    });

    expect(container.textContent).toBe('1 Jun 2027');
    expect(screen.getByRole('button', { name: 'Warning' })).toBeInTheDocument();
  });

  it('does not warn when the resource ends on its own termination date', () => {
    renderField({
      end_date: '2027-06-01',
      resource_effective_end_date: '2027-06-01',
    });

    expect(screen.queryByRole('button', { name: 'Warning' })).toBeNull();
  });

  it('shows a dash when nothing is scheduled to terminate the resource', () => {
    const { container } = renderField({ resource_effective_end_date: null });

    expect(container.textContent).toBe('\u2014');
  });
});
