import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { WizardButtons } from './WizardButtons';

describe('WizardButtons', () => {
  it('renders Next and Close on first step, hides Back', async () => {
    const user = userEvent.setup();
    const goNext = vi.fn();
    const goBack = vi.fn();

    render(
      <WizardButtons
        isFirstStep={true}
        isLastStep={false}
        goBack={goBack}
        goNext={goNext}
        submitting={false}
        invalid={false}
      />,
    );

    expect(screen.queryByText('Back')).not.toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();

    await user.click(screen.getByText('Next'));
    expect(goNext).toHaveBeenCalledOnce();
  });

  it('renders Back, Close, and Next on middle step', async () => {
    const user = userEvent.setup();
    const goNext = vi.fn();
    const goBack = vi.fn();

    render(
      <WizardButtons
        isFirstStep={false}
        isLastStep={false}
        goBack={goBack}
        goNext={goNext}
        submitting={false}
        invalid={false}
      />,
    );

    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();

    await user.click(screen.getByText('Back'));
    expect(goBack).toHaveBeenCalledOnce();
  });

  it('renders Confirm submit button on last step', () => {
    render(
      <WizardButtons
        isFirstStep={false}
        isLastStep={true}
        goBack={vi.fn()}
        goNext={vi.fn()}
        submitting={false}
        invalid={false}
      />,
    );

    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /confirm/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('renders custom submit label on last step', () => {
    render(
      <WizardButtons
        isFirstStep={false}
        isLastStep={true}
        goBack={vi.fn()}
        goNext={vi.fn()}
        submitting={false}
        invalid={false}
        submitLabel="Deploy Now"
      />,
    );

    expect(
      screen.getByRole('button', { name: /deploy now/i }),
    ).toBeInTheDocument();
  });
});
