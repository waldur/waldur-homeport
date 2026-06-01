import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormSteps } from './FormSteps';

// Mock PageBarTabs to render tabs content directly
vi.mock('@/marketplace/common/PageBarTabs', () => ({
  PageBarTabs: ({
    tabs,
  }: {
    tabs: { key: string; title: React.ReactNode }[];
  }) => (
    <div data-testid="page-bar-tabs">
      {tabs.map((tab) => (
        <div key={tab.key} data-testid={`tab-${tab.key}`}>
          {tab.title}
        </div>
      ))}
    </div>
  ),
}));

// Mock Tooltip to render children directly
vi.mock('@/core/Tooltip', () => ({
  Tip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('FormSteps', () => {
  const baseSteps = [
    {
      label: 'General information',
      id: 'step-general',
      required: true,
      fields: ['customer', 'project'],
    },
    { label: 'Plan', id: 'step-plan', required: true, fields: ['plan'] },
    {
      label: 'Additional configuration',
      id: 'step-additional',
      required: false,
      fields: ['attributes.option1'],
    },
    {
      label: 'Final configuration',
      id: 'step-final',
      required: true,
      fields: ['attributes.name'],
    },
  ];

  describe('disabled steps', () => {
    it('shows lock icon for disabled steps', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, true, true, true]}
          completedSteps={[false, false, false, false]}
        />,
      );

      // First step should not have lock icon
      const generalTab = screen.getByTestId('tab-step-general');
      expect(
        within(generalTab).queryByTestId('step-locked-icon'),
      ).not.toBeInTheDocument();

      // Other steps should have lock icon and muted text
      const planTab = screen.getByTestId('tab-step-plan');
      expect(
        within(planTab).getByTestId('step-locked-icon'),
      ).toBeInTheDocument();
      expect(within(planTab).getByText('Plan')).toHaveClass('text-muted');
    });

    it('applies text-muted class to disabled step labels', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, true, true, true]}
          completedSteps={[false, false, false, false]}
        />,
      );

      const planTab = screen.getByTestId('tab-step-plan');
      expect(within(planTab).getByText('Plan')).toHaveClass('text-muted');
    });
  });

  describe('required incomplete steps', () => {
    it('shows empty circle for required steps that are not completed', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[true, false, false, false]}
        />,
      );

      // Plan step is required but not completed - should have circle icon
      const planTab = screen.getByTestId('tab-step-plan');
      // CircleIcon should be present (not CheckCircleIcon)
      expect(
        within(planTab).getByTestId('step-incomplete-icon'),
      ).toBeInTheDocument();
    });

    it('does not show circle for optional steps that are not completed', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[true, true, false, true]}
        />,
      );

      // Additional configuration is optional and not completed
      const additionalTab = screen.getByTestId('tab-step-additional');
      // Should not have any icon
      expect(
        within(additionalTab).queryByTestId('step-incomplete-icon'),
      ).toBeNull();
    });
  });

  describe('completed steps', () => {
    it('shows check circle for completed steps', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[true, true, false, false]}
        />,
      );

      // General and Plan steps are completed
      const generalTab = screen.getByTestId('tab-step-general');
      const planTab = screen.getByTestId('tab-step-plan');

      expect(
        within(generalTab).getByTestId('step-completed-icon'),
      ).toBeInTheDocument();
      expect(
        within(planTab).getByTestId('step-completed-icon'),
      ).toBeInTheDocument();
    });
  });

  describe('error states', () => {
    it('shows warning icon for steps with non-required errors', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[true, false, false, false]}
          errors={{ plan: 'Invalid plan selection' }}
        />,
      );

      const planTab = screen.getByTestId('tab-step-plan');
      expect(
        within(planTab).getByTestId('step-error-icon'),
      ).toBeInTheDocument();
    });

    it('shows X icon for steps with critical errors', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[true, false, false, false]}
          criticalErrors={{ plan: 'Critical error' }}
        />,
      );

      const planTab = screen.getByTestId('tab-step-plan');
      expect(
        within(planTab).getByTestId('step-critical-error-icon'),
      ).toBeInTheDocument();
    });

    it('filters out required errors by default', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[true, false, false, false]}
          errors={{ plan: 'This field is required' }}
        />,
      );

      // Required errors are filtered out, so no warning icon
      const planTab = screen.getByTestId('tab-step-plan');
      expect(
        within(planTab).queryByTestId('step-error-icon'),
      ).not.toBeInTheDocument();
    });

    it('shows required errors when showRequiredErrors is true', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[true, false, false, false]}
          errors={{ plan: 'This field is required' }}
          showRequiredErrors
        />,
      );

      const planTab = screen.getByTestId('tab-step-plan');
      expect(
        within(planTab).getByTestId('step-error-icon'),
      ).toBeInTheDocument();
    });
  });

  describe('priority of indicators', () => {
    it('disabled state takes priority over completed state', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, true, false, false]}
          completedSteps={[true, true, false, false]}
        />,
      );

      // Plan is both disabled and completed - disabled should win
      const planTab = screen.getByTestId('tab-step-plan');
      expect(within(planTab).getByText('Plan')).toHaveClass('text-muted');
      // Should not have success check icon
      expect(
        within(planTab).queryByTestId('step-completed-icon'),
      ).not.toBeInTheDocument();
    });

    it('disabled state takes priority over error state', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, true, false, false]}
          completedSteps={[true, false, false, false]}
          errors={{ plan: 'Invalid value' }}
        />,
      );

      // Plan is disabled with error - disabled should win
      const planTab = screen.getByTestId('tab-step-plan');
      expect(within(planTab).getByText('Plan')).toHaveClass('text-muted');
      expect(
        within(planTab).queryByTestId('step-error-icon'),
      ).not.toBeInTheDocument();
    });

    it('critical errors take priority over normal errors', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[true, false, false, false]}
          errors={{ plan: 'Warning error' }}
          criticalErrors={{ plan: 'Critical error' }}
        />,
      );

      const planTab = screen.getByTestId('tab-step-plan');
      expect(
        within(planTab).getByTestId('step-critical-error-icon'),
      ).toBeInTheDocument();
      expect(
        within(planTab).queryByTestId('step-error-icon'),
      ).not.toBeInTheDocument();
    });
  });

  describe('step labels', () => {
    it('renders step labels correctly', () => {
      render(
        <FormSteps
          steps={baseSteps}
          disabledSteps={[false, false, false, false]}
          completedSteps={[false, false, false, false]}
        />,
      );

      expect(screen.getByText('General information')).toBeInTheDocument();
      expect(screen.getByText('Plan')).toBeInTheDocument();
      expect(screen.getByText('Additional configuration')).toBeInTheDocument();
      expect(screen.getByText('Final configuration')).toBeInTheDocument();
    });
  });
});
