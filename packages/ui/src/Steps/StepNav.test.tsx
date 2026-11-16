import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getStepNavItems, StepNav, StepNavStep } from './StepNav';

const renderItems = (steps: StepNavStep[], hideStatusIcons?: boolean) =>
  render(
    <ul>
      {getStepNavItems(steps, { hideStatusIcons }).map((item) => (
        <li key={item.key} data-testid={`item-${item.key}`}>
          {item.title}
        </li>
      ))}
    </ul>,
  );

describe('getStepNavItems', () => {
  it('keys each item by the step id', () => {
    const items = getStepNavItems([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ]);
    expect(items.map((item) => item.key)).toEqual(['a', 'b']);
  });

  it.each([
    ['locked', 'LockIcon'],
    ['error', 'XCircleIcon'],
    ['warning', 'WarningCircleIcon'],
    ['complete', 'CheckCircleIcon'],
    ['required', 'CircleIcon'],
  ] as const)('draws the %s status as %s', (status, icon) => {
    renderItems([{ id: 's', label: 'Step', status }]);
    expect(
      within(screen.getByTestId('item-s')).getByTestId(icon),
    ).toBeInTheDocument();
  });

  it('draws no icon for a step without a status', () => {
    renderItems([{ id: 's', label: 'Step' }]);
    expect(
      within(screen.getByTestId('item-s')).queryByRole('img'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Step')).not.toHaveAttribute('data-error');
  });

  it('marks an error or a warning with data-error', () => {
    renderItems([
      { id: 'e', label: 'Errored', status: 'error' },
      { id: 'w', label: 'Warned', status: 'warning' },
      { id: 'c', label: 'Done', status: 'complete' },
    ]);
    expect(screen.getByText('Errored')).toHaveAttribute('data-error');
    expect(screen.getByText('Warned')).toHaveAttribute('data-error');
    expect(screen.getByText('Done')).not.toHaveAttribute('data-error');
  });

  it('mutes a locked step', () => {
    renderItems([{ id: 'l', label: 'Locked', status: 'locked' }]);
    expect(screen.getByText('Locked')).toHaveClass('text-quaternary');
  });

  it('leaves the icons out when asked, keeping the error mark', () => {
    renderItems([{ id: 'e', label: 'Errored', status: 'error' }], true);
    expect(
      within(screen.getByTestId('item-e')).queryByTestId('XCircleIcon'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Errored')).toHaveAttribute('data-error');
  });
});

describe('StepNav', () => {
  it('renders a link per step to its section', () => {
    render(
      <StepNav
        steps={[
          { id: 'step-general', label: 'General' },
          { id: 'step-plan', label: 'Plan' },
        ]}
      />,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plan' })).toHaveAttribute(
      'href',
      '#step-plan',
    );
  });
});
