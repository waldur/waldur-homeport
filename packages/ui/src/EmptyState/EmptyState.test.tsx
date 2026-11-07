import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('says what is missing', () => {
    render(<EmptyState message="No presets match the search." />);
    expect(
      screen.getByText('No presets match the search.'),
    ).toBeInTheDocument();
  });

  it('puts the title above the message and the action below', () => {
    render(
      <EmptyState
        title="No scenarios"
        message="Save a scenario to check the workflow against it."
        action={<button type="button">Add scenario</button>}
        data-testid="empty"
      />,
    );
    const empty = screen.getByTestId('empty');
    expect(empty).toHaveTextContent(
      'No scenariosSave a scenario to check the workflow against it.Add scenario',
    );
    expect(
      screen.getByRole('button', { name: 'Add scenario' }),
    ).toBeInTheDocument();
  });

  it('is framed by default and plain at size sm', () => {
    const { rerender } = render(
      <EmptyState message="Nothing here" data-testid="empty" />,
    );
    expect(screen.getByTestId('empty')).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('empty')).toHaveClass('border-dashed');

    rerender(
      <EmptyState size="sm" message="Nothing here" data-testid="empty" />,
    );
    expect(screen.getByTestId('empty')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('empty')).not.toHaveClass('border-dashed');
  });
});
