import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProfileRequests } from './ProfileRequests';

vi.mock('@/proposals/proposal/UserProposalsList', () => ({
  UserProposalsList: (props: {
    actions?: React.ReactNode;
    standalone?: boolean;
  }) => (
    <div data-testid="requests-list" data-standalone={String(props.standalone)}>
      {props.actions}
    </div>
  ),
}));

vi.mock('./ResourceRequestsList', () => ({
  ResourceRequestsList: (props: {
    actions?: React.ReactNode;
    standalone?: boolean;
  }) => (
    <div
      data-testid="resources-list"
      data-standalone={String(props.standalone)}
    >
      {props.actions}
    </div>
  ),
}));

// Radix RadioGroup checks a segment on focus only while an arrow key is held (it
// clears that flag on keyup), and roving focus moves focus in a timeout. A real
// key press lasts long enough for both; user-event's instant down+up does not,
// so hold the key until the selection has landed.
const pressArrow = async (
  user: UserEvent,
  key: 'ArrowRight' | 'ArrowLeft',
  landed: () => void,
) => {
  await user.keyboard(`{${key}>}`);
  await waitFor(landed);
  await user.keyboard(`{/${key}}`);
};

describe('ProfileRequests', () => {
  it('exposes the lens switch as one named radio group', () => {
    render(<ProfileRequests />);

    expect(
      screen.getByRole('radiogroup', { name: 'Group by' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'By proposal' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'By resource' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('keeps both lenses out of the standalone header', async () => {
    // The standalone header sizes up every button in it, so a lens left
    // standalone resizes the switcher as you toggle.
    const user = userEvent.setup();
    render(<ProfileRequests />);

    expect(screen.getByTestId('requests-list')).toHaveAttribute(
      'data-standalone',
      'false',
    );

    await user.click(screen.getByRole('radio', { name: 'By resource' }));

    expect(screen.getByTestId('resources-list')).toHaveAttribute(
      'data-standalone',
      'false',
    );
  });

  it('keeps focus on the selected segment after the list remounts', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    await user.click(screen.getByRole('radio', { name: 'By resource' }));

    expect(screen.getByTestId('resources-list')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'By resource' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'By resource' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('restores keyboard focus after an arrow-key switch', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    screen.getByRole('radio', { name: 'By proposal' }).focus();
    await pressArrow(user, 'ArrowRight', () =>
      expect(screen.getByRole('radio', { name: 'By resource' })).toBeChecked(),
    );

    const selected = screen.getByRole('radio', { name: 'By resource' });
    expect(selected).toHaveAttribute('aria-checked', 'true');
    expect(selected).toHaveFocus();
  });

  it('focuses the segment when its label is clicked again', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    const selected = screen.getByRole('radio', { name: 'By proposal' });
    selected.blur();
    await user.click(screen.getByText('By proposal'));

    expect(screen.getByRole('radio', { name: 'By proposal' })).toHaveFocus();
    expect(screen.getByTestId('requests-list')).toBeInTheDocument();
  });

  it('keeps only the checked segment in the tab order', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    const requests = screen.getByRole('radio', { name: 'By proposal' });
    const resources = screen.getByRole('radio', { name: 'By resource' });
    expect(
      screen.getByRole('radiogroup', { name: 'Group by' }),
    ).toHaveAttribute('aria-orientation', 'horizontal');

    await user.tab();
    expect(requests).toHaveFocus();
    expect(requests).toHaveAttribute('tabindex', '0');
    expect(resources).toHaveAttribute('tabindex', '-1');
    await pressArrow(user, 'ArrowRight', () =>
      expect(screen.getByRole('radio', { name: 'By resource' })).toBeChecked(),
    );

    expect(screen.getByRole('radio', { name: 'By resource' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'By resource' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'By resource' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('radio', { name: 'By proposal' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('moves the arrow from the focused segment, not the checked one', async () => {
    const user = userEvent.setup();
    render(<ProfileRequests />);

    const resources = screen.getByRole('radio', { name: 'By resource' });
    resources.focus();
    await pressArrow(user, 'ArrowLeft', () =>
      expect(screen.getByRole('radio', { name: 'By proposal' })).toHaveFocus(),
    );

    expect(screen.getByRole('radio', { name: 'By proposal' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'By proposal' })).toHaveFocus();
    expect(screen.getByTestId('requests-list')).toBeInTheDocument();
  });

  it('does not take focus on first render', () => {
    render(<ProfileRequests />);

    expect(document.body).toHaveFocus();
  });
});
