import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressStep, ProgressSteps } from './ProgressSteps';

const steps = (
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
    render(<ProgressSteps steps={steps(1)} />);
    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(1);
    expect(screen.getAllByTestId('CircleIcon')).toHaveLength(2);
  });

  it("uses a step's own icon over the default", () => {
    // A rejected proposal passes an ✕ for its completed Decision step.
    render(
      <ProgressSteps
        steps={steps(3, [{}, {}, { icon: <span data-testid="custom-icon" /> }])}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('CheckIcon')).toHaveLength(2);
  });
});
