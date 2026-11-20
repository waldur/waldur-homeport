import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EndDateTooltip } from './EndDateTooltip';

const renderTooltip = (state?: string) =>
  render(<EndDateTooltip end_date="2030-01-01" state={state} />);

describe('EndDateTooltip', () => {
  it('shows the date for a live resource', () => {
    renderTooltip('OK');

    expect(
      screen.getByRole('button', { name: 'Termination date' }),
    ).toBeInTheDocument();
  });

  it('shows the date when the row does not carry a state', () => {
    renderTooltip();

    expect(
      screen.getByRole('button', { name: 'Termination date' }),
    ).toBeInTheDocument();
  });

  it.each(['Terminated', 'Terminating'])('hides the date when %s', (state) => {
    renderTooltip(state);

    expect(
      screen.queryByRole('button', { name: 'Termination date' }),
    ).not.toBeInTheDocument();
  });
});
