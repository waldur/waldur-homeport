import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProfileRequests } from './ProfileRequests';

vi.mock('@/proposals/proposal/UserProposalsList', () => ({
  UserProposalsList: (props: { actions?: React.ReactNode }) => (
    <div data-testid="requests-list">{props.actions}</div>
  ),
}));

vi.mock('./ResourceRequestsList', () => ({
  ResourceRequestsList: (props: { actions?: React.ReactNode }) => (
    <div data-testid="resources-list">{props.actions}</div>
  ),
}));

describe('ProfileRequests', () => {
  it('exposes the lens switch as one named tab list', () => {
    render(<ProfileRequests />);

    expect(
      screen.getByRole('tablist', { name: 'Group by' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'By proposal' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'By resource' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('keeps focus on the selected segment after the list remounts', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    await user.click(screen.getByRole('tab', { name: 'By resource' }));

    expect(screen.getByTestId('resources-list')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'By resource' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'By resource' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('restores keyboard focus after an arrow-key switch', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    screen.getByRole('tab', { name: 'By proposal' }).focus();
    await user.keyboard('{ArrowRight}');

    const selected = screen.getByRole('tab', { name: 'By resource' });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveFocus();
  });

  it('focuses the segment when its label is clicked again', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    const selected = screen.getByRole('tab', { name: 'By proposal' });
    selected.blur();
    await user.click(screen.getByText('By proposal'));

    expect(screen.getByRole('tab', { name: 'By proposal' })).toHaveFocus();
    expect(screen.getByTestId('requests-list')).toBeInTheDocument();
  });

  it('keeps only the checked segment in the tab order', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    const requests = screen.getByRole('tab', { name: 'By proposal' });
    const resources = screen.getByRole('tab', { name: 'By resource' });
    expect(screen.getByRole('tablist', { name: 'Group by' })).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );

    await user.tab();
    expect(requests).toHaveFocus();
    expect(requests).toHaveAttribute('tabindex', '0');
    expect(resources).toHaveAttribute('tabindex', '-1');
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'By resource' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'By resource' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'By resource' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('tab', { name: 'By proposal' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('moves the arrow from the focused segment, not the checked one', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    const resources = screen.getByRole('tab', { name: 'By resource' });
    resources.focus();
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { name: 'By proposal' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'By proposal' })).toHaveFocus();
    expect(screen.getByTestId('requests-list')).toBeInTheDocument();
  });
});
