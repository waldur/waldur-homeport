import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProgressStep } from './ProgressSteps';
import { VerticalProgressSteps } from './VerticalProgressSteps';

const steps = (
  completed: number,
  overrides: Partial<ProgressStep>[] = [],
): ProgressStep[] =>
  ['Method', 'Identification', 'Result', 'Intent'].map((label, i) => ({
    key: label.toLowerCase(),
    label,
    completed: i < completed,
    ...overrides[i],
  }));

const markers = () => screen.getAllByTestId('step-marker');
const items = () => screen.getAllByRole('listitem');
const buttons = () => screen.getAllByRole('button');

// Every background utility a marker can carry. Exactly one may apply: two on
// one element compete, and which wins depends on their order in the
// generated CSS rather than on the step's state.
const BG = /^(?:dark:)?bg-/;
const bgClasses = (el: HTMLElement) =>
  [...el.classList].filter((c) => BG.test(c) && !c.startsWith('dark:'));

describe('VerticalProgressSteps', () => {
  it('marks the first step after the last completed one as current', () => {
    render(<VerticalProgressSteps steps={steps(2)} />);
    const current = buttons().filter(
      (b) => b.getAttribute('aria-current') === 'step',
    );
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Result');
  });

  it('makes the first step current when nothing is completed', () => {
    render(<VerticalProgressSteps steps={steps(0)} />);
    expect(buttons()[0]).toHaveAttribute('aria-current', 'step');
  });

  it('paints completed and current steps brand and upcoming ones neutral', () => {
    render(<VerticalProgressSteps steps={steps(2)} />);
    const [first, second, current, upcoming] = markers();
    expect(first).toHaveClass('bg-[var(--bg-brand-solid)]');
    expect(second).toHaveClass('bg-[var(--bg-brand-solid)]');
    expect(current).toHaveClass(
      'bg-[var(--bg-brand-solid)]',
      'ring-4',
      'ring-[var(--bg-brand-subtle)]',
    );
    expect(upcoming).toHaveClass('bg-tertiary');
    expect(upcoming).not.toHaveClass('ring-4');
  });

  it('gives every marker exactly one background class', () => {
    render(
      <VerticalProgressSteps steps={steps(1, [{}, { variant: 'danger' }])} />,
    );
    for (const marker of markers()) {
      expect(bgClasses(marker)).toHaveLength(1);
    }
  });

  // Regression: the current step used `bg-${variant}`, i.e. `bg-primary`.
  // Once Bootstrap stopped emitting .bg-primary that resolved to the white
  // surface (and lost to the component stylesheet anyway), leaving a white
  // icon on a light-gray circle.
  it('never builds a bg-primary or bg-secondary class', () => {
    render(<VerticalProgressSteps steps={steps(1)} />);
    for (const marker of markers()) {
      expect(marker).not.toHaveClass('bg-primary');
      expect(marker).not.toHaveClass('bg-secondary');
    }
  });

  /* eslint-disable waldur-custom/no-raw-status-ramp -- asserts the component's halo ring classes, a deliberate step outside the matrix */
  it.each([
    ['success', 'bg-success', 'ring-success-100'],
    ['warning', 'bg-warning', 'ring-warning-100'],
    ['danger', 'bg-danger', 'ring-error-100'],
    ['info', 'bg-info-600', 'ring-[var(--status-info-bg)]'],
  ] as const)(
    'fills the current step from its %s variant',
    (variant, bg, ring) => {
      render(<VerticalProgressSteps steps={steps(1, [{}, { variant }])} />);
      expect(markers()[1]).toHaveClass(bg, ring);
    },
  );
  /* eslint-enable waldur-custom/no-raw-status-ramp */

  it('applies the variant only to the current step', () => {
    render(
      <VerticalProgressSteps
        steps={steps(1, [{}, {}, { variant: 'danger' }])}
      />,
    );
    expect(markers()[2]).toHaveClass('bg-tertiary');
    expect(markers()[2]).not.toHaveClass('bg-danger');
  });

  it('draws the connector brand below completed steps only', () => {
    render(<VerticalProgressSteps steps={steps(2)} />);
    const [first, second, current, last] = items();
    expect(first).toHaveClass('not-last:after:bg-[var(--bg-brand-solid)]');
    expect(second).toHaveClass('not-last:after:bg-[var(--bg-brand-solid)]');
    expect(current).toHaveClass('not-last:after:bg-[var(--border-divider)]');
    // The last step has no connector: the not-last: variant drops it.
    expect(last).toHaveClass("not-last:after:content-['']");
  });

  it('shows a check on completed steps and a dot on the others', () => {
    render(<VerticalProgressSteps steps={steps(2)} />);
    // Icons render as <span data-testid="IconName"> in unit tests.
    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(2);
    expect(screen.getAllByTestId('CircleIcon')).toHaveLength(2);
  });

  it("uses a step's own icon over the default", () => {
    render(
      <VerticalProgressSteps
        steps={steps(0, [{ icon: <span data-testid="custom-icon" /> }])}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('CircleIcon')).toHaveLength(3);
  });

  it('calls onClick for completed and current steps only', async () => {
    const onClick = vi.fn();
    render(<VerticalProgressSteps steps={steps(1)} onClick={onClick} />);
    const [completed, current, upcoming] = buttons();

    await userEvent.click(completed);
    await userEvent.click(current);
    await userEvent.click(upcoming);

    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ key: 'method' }),
      0,
    );
    expect(onClick).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ key: 'identification' }),
      1,
    );
  });

  it('only puts clickable steps in the tab order', () => {
    render(<VerticalProgressSteps steps={steps(1)} onClick={vi.fn()} />);
    expect(buttons().map((b) => b.tabIndex)).toEqual([0, 0, -1, -1]);
  });

  it('activates a clickable step with Enter and Space', async () => {
    const onClick = vi.fn();
    render(<VerticalProgressSteps steps={steps(1)} onClick={onClick} />);
    buttons()[1].focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'identification' }),
      1,
    );
  });
});
