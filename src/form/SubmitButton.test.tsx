import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { SubmitButton } from './SubmitButton';

const renderButton = (options = {}) =>
  render(
    <SubmitButton
      submitting={false}
      disabled={false}
      label="Create project"
      {...options}
    />,
  );

describe('SubmitButton', () => {
  it('renders enabled button without spinner', () => {
    renderButton();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).not.toHaveClass('animation-spin');
  });

  it('renders disabled button without spinner', () => {
    renderButton({ disabled: true });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).not.toHaveClass('animation-spin');
  });

  it('renders spinner and blocks button', () => {
    renderButton({ submitting: true });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('SpinnerIcon')).toBeInTheDocument();
  });
});
