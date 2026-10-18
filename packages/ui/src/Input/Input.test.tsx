import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
  it('is a text input by default and forwards its ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Name" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('type', 'text');
    expect(ref.current).toBe(input);
  });

  it('passes native props through and reports typing', async () => {
    const onChange = vi.fn();
    render(
      <Input
        aria-label="Email"
        type="email"
        placeholder="you@example.com"
        onChange={onChange}
      />,
    );
    const input = screen.getByPlaceholderText('you@example.com');
    expect(input).toHaveAttribute('type', 'email');
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('maps invalid to aria-invalid', () => {
    const { rerender } = render(<Input aria-label="Name" invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    rerender(<Input aria-label="Name" invalid={false} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('keeps an explicit aria-invalid', () => {
    render(<Input aria-label="Name" aria-invalid="true" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('pins its size in px so it does not follow the root font-size', () => {
    const { rerender } = render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox')).toHaveClass(
      'py-[9px]',
      'pl-[calc(12px+var(--input-start,0px))]',
      'text-sm',
      'rounded-lg',
    );
    rerender(<Input aria-label="Name" size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass(
      'py-[5px]',
      'text-xs',
      'rounded-md',
    );
  });

  it('uses border-[1px], never the Bootstrap-colliding border class', () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-[1px]');
    expect(input).not.toHaveClass('border');
  });

  it('swaps the surface for the solid variant', () => {
    render(<Input aria-label="Name" solid />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'bg-[var(--input-solid-bg)]',
      'focus:border-[var(--input-solid-border-focus)]',
      'disabled:bg-[var(--input-solid-bg)]',
    );
    // cn() dropped the outlined defaults the solid ones replace.
    expect(input).not.toHaveClass(
      'bg-[var(--input-bg)]',
      'focus:border-[var(--input-border-focus)]',
      'disabled:bg-[var(--input-disabled-bg)]',
    );
  });

  it("lets a caller's padding replace the default", () => {
    render(<Input aria-label="Name" className="px-2" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-2');
    expect(input).not.toHaveClass('pl-[calc(12px+var(--input-start,0px))]');
  });

  it('maps htmlSize to the native size attribute', () => {
    render(<Input aria-label="Code" htmlSize={6} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('size', '6');
  });

  it('does not take input when disabled', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" disabled onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'a');
    expect(onChange).not.toHaveBeenCalled();
  });
});
