/* eslint-disable testing-library/no-container, testing-library/no-node-access -- the box and marks around the input are what these tests check */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('is a native checkbox that reports changes', async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Agree" onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Agree' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.checked).toBe(true);
  });

  it('sets the indeterminate DOM property', () => {
    const { rerender } = render(
      <Checkbox aria-label="All" indeterminate readOnly />,
    );
    const box = screen.getByRole('checkbox') as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    rerender(<Checkbox aria-label="All" indeterminate={false} readOnly />);
    expect(box.indeterminate).toBe(false);
  });

  it('forwards its ref to the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} aria-label="Ref" readOnly />);
    expect(ref.current).toBe(screen.getByRole('checkbox'));
  });

  it('sizes the box around the input and puts layout classes on it', () => {
    render(
      <Checkbox size="sm" className="me-[12px]" aria-label="Small" readOnly />,
    );
    const box = screen.getByRole('checkbox').parentElement;
    expect(box).toHaveClass('size-[16px]', 'me-[12px]');
  });

  it('draws the check and dash as hidden SVG marks', () => {
    const { container } = render(<Checkbox aria-label="Marks" readOnly />);
    const marks = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(marks).toHaveLength(2);
  });

  it('hides the whole box with `hidden`', () => {
    render(<Checkbox hidden aria-label="Hidden" readOnly />);
    const input = screen.getByRole('checkbox', { hidden: true });
    expect(input.parentElement).toHaveAttribute('hidden');
  });
});

describe('label props', () => {
  it('names the control by its label and toggles it from the text', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        label="Remember me"
        description="On this device only"
        onCheckedChange={onCheckedChange}
      />,
    );
    const box = screen.getByRole('checkbox', { name: /Remember me/ });
    await userEvent.click(screen.getByText('Remember me'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toBeChecked();
    expect(screen.getByText('On this device only')).toBeInTheDocument();
  });

  it('reads the description as help text, not as part of the name', () => {
    render(<Checkbox label="Preserve permissions" description="Keeps roles" />);
    const box = screen.getByRole('checkbox', { name: 'Preserve permissions' });
    expect(box).toHaveAccessibleDescription('Keeps roles');
  });

  it('greys the label of a disabled control', () => {
    render(<Checkbox label="Usage-based" disabled />);
    expect(screen.getByText('Usage-based')).toHaveClass(
      'text-[var(--check-label-disabled)]',
    );
  });
});
