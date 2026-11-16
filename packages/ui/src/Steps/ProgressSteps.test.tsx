import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProgressStep, ProgressSteps } from './ProgressSteps';

const steps: ProgressStep[] = [
  { key: 'account', label: 'Account', completed: true },
  { key: 'organization', label: 'Organization', completed: false },
  { key: 'review', label: 'Review', completed: false },
];

const numberedSteps = (
  completed: number,
  overrides: Partial<ProgressStep>[] = [],
): ProgressStep[] =>
  ['Draft', 'Review', 'Decision'].map((label, i) => ({
    key: label.toLowerCase(),
    label,
    completed: i < completed,
    ...overrides[i],
  }));

describe('ProgressSteps', () => {
  it('marks completed steps with a check and the rest with a dot', () => {
    render(<ProgressSteps steps={numberedSteps(1)} />);
    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(1);
    expect(screen.getAllByTestId('CircleIcon')).toHaveLength(2);
  });

  it("uses a step's own icon over the default", () => {
    // A rejected proposal passes an ✕ for its completed Decision step.
    render(
      <ProgressSteps
        steps={numberedSteps(3, [
          {},
          {},
          { icon: <span data-testid="custom-icon" /> },
        ])}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(2);
  });

  it('renders clickable steps as buttons the keyboard reaches', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ProgressSteps steps={steps} onClick={onClick} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    for (const button of buttons) {
      expect(button).toHaveAttribute('type', 'button');
    }

    await user.tab();
    expect(screen.getByRole('button', { name: 'Account' })).toHaveFocus();
    await user.tab();
    const organization = screen.getByRole('button', { name: 'Organization' });
    expect(organization).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenLastCalledWith(steps[1], 1);
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(onClick).toHaveBeenLastCalledWith(steps[2], 2);
  });

  it('marks the current step on its button', () => {
    render(<ProgressSteps steps={steps} onClick={vi.fn()} />);

    expect(
      screen.getByRole('button', { current: 'step' }),
    ).toHaveAccessibleName('Organization');
    expect(
      screen.queryByRole('listitem', { current: 'step' }),
    ).not.toBeInTheDocument();
  });

  it('keeps steps plain, out of the tab order, when nothing opens them', async () => {
    const user = userEvent.setup();
    render(<ProgressSteps steps={steps} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.getByRole('listitem', { current: 'step' }),
    ).toHaveAccessibleName('Organization');

    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('leaves a disabled step plain among clickable ones', () => {
    render(
      <ProgressSteps
        steps={[
          ...steps.slice(0, 2),
          { key: 'review', label: 'Review', completed: false, disabled: true },
        ]}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(2);
    const review = screen.getByRole('listitem', { name: 'Review' });
    expect(within(review).queryByRole('button')).not.toBeInTheDocument();
  });

  it('controls completed and current steps via activeIndex', () => {
    render(<ProgressSteps steps={numberedSteps(0)} activeIndex={1} />);
    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(1);
    expect(screen.getAllByTestId('CircleIcon')).toHaveLength(2);
    expect(screen.getByRole('listitem', { name: 'Review' })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });
});
