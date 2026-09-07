import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { PlanSwitchModeExplanation } from './PlanSwitchModeExplanation';

describe('PlanSwitchModeExplanation', () => {
  it('renders nothing when both plans bill the same way', () => {
    const { container } = renderWithProviders(
      <PlanSwitchModeExplanation
        currentMode="limit"
        targetMode="limit"
        currentPlanName="A"
        targetPlanName="B"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('explains a limit to usage switch', () => {
    renderWithProviders(
      <PlanSwitchModeExplanation
        currentMode="limit"
        targetMode="usage"
        currentPlanName="Reserved"
        targetPlanName="Pay as you go"
      />,
    );
    expect(
      screen.getByText(/Switching from limit-based to usage-based billing/),
    ).toBeInTheDocument();
  });

  it('lists the billed limits for a usage to limit switch', () => {
    renderWithProviders(
      <PlanSwitchModeExplanation
        currentMode="usage"
        targetMode="limit"
        currentPlanName="Pay as you go"
        targetPlanName="Reserved"
        billedLimits={[
          {
            name: 'Cores',
            limit: 4,
            measured_unit: 'cores',
            price: 10,
            subTotal: 40,
          },
        ]}
        concealPrices
      />,
    );
    expect(
      screen.getByText(/Switching from usage-based to limit-based billing/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cores: 4 cores/)).toBeInTheDocument();
  });

  it('uses the generic sentence with labels for other pairs', () => {
    renderWithProviders(
      <PlanSwitchModeExplanation
        currentMode="prepaid"
        targetMode="usage"
        currentPlanName="Annual"
        targetPlanName="Pay as you go"
      />,
    );
    expect(
      screen.getByText(
        'The billing model changes from Prepaid to Usage-based on the day of the switch.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/limit-based to usage-based/)).toBeNull();
  });
});
