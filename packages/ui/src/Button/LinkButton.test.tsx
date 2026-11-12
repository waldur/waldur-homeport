import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('renders with type="button" and default brand styling', () => {
    render(<LinkButton>Click me</LinkButton>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('text-[var(--text-brand-secondary)]');
    expect(button).toHaveClass('text-sm');
  });

  it('renders with danger variant', () => {
    render(<LinkButton variant="danger">Try again</LinkButton>);
    const button = screen.getByRole('button', { name: 'Try again' });
    expect(button).toHaveClass('text-danger');
  });

  it('renders with subtle variant', () => {
    render(<LinkButton variant="subtle">Details</LinkButton>);
    const button = screen.getByRole('button', { name: 'Details' });
    expect(button).toHaveClass('text-primary');
    expect(button).toHaveClass('underline');
  });

  it('handles click events when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<LinkButton onClick={onClick}>Trigger</LinkButton>);
    await user.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports disabled state and forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <LinkButton ref={ref} disabled>
        Disabled
      </LinkButton>,
    );
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(ref.current).toBe(button);
  });

  it('merges custom className and allows overriding size', () => {
    render(<LinkButton className="font-semibold text-xs">Custom</LinkButton>);
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('font-semibold');
    expect(button).toHaveClass('text-xs');
    expect(button).not.toHaveClass('text-sm');
  });
});
