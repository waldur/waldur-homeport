import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NumberInput } from './NumberInput';

const renderInput = (value, props = {}) => {
  const onValueChange = vi.fn();
  const onBlur = vi.fn();
  render(
    <NumberInput
      value={value}
      onValueChange={onValueChange}
      onBlur={onBlur}
      min={1}
      max={20}
      {...props}
    />,
  );
  return { input: screen.getByRole('spinbutton'), onValueChange, onBlur };
};

describe('NumberInput', () => {
  it.each([[''], [undefined], [null]])(
    'leaves an empty field (%j) valid and empty on blur',
    (value) => {
      const { input, onValueChange, onBlur } = renderInput(value);
      expect(input).not.toHaveAttribute('aria-invalid');
      fireEvent.blur(input);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onBlur).toHaveBeenCalled();
    },
  );

  it.each([
    [0, 1],
    [50, 20],
  ])('shows %j invalid and clamps it to %j on blur', (value, clamped) => {
    const { input, onValueChange } = renderInput(value);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledWith(clamped);
  });

  it('keeps a value in range', () => {
    const { input, onValueChange } = renderInput(5);
    expect(input).not.toHaveAttribute('aria-invalid');
    fireEvent.blur(input);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('reports typed text', async () => {
    const { input, onValueChange } = renderInput('');
    await userEvent.type(input, '7');
    expect(onValueChange).toHaveBeenCalledWith('7');
  });

  it('moves by the step, rounded to its precision, within the range', async () => {
    const { onValueChange } = renderInput(0.2, { step: 0.1, min: 0, max: 0.3 });
    await userEvent.click(
      screen.getByRole('button', { name: 'Increase value' }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith(0.3);
    await userEvent.click(
      screen.getByRole('button', { name: 'Decrease value' }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith(0.1);
  });

  it('can hide the steppers and show a unit', () => {
    renderInput(5, { showSteppers: false, unit: 'GB' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('GB')).toBeInTheDocument();
  });

  it('is invalid when told so even in range', () => {
    const { input } = renderInput(5, { invalid: true });
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('reads the precision of a step written in exponent form', async () => {
    const { onValueChange } = renderInput(0, { step: 1e-7, min: 0 });
    await userEvent.click(
      screen.getByRole('button', { name: 'Increase value' }),
    );
    expect(onValueChange).toHaveBeenLastCalledWith(0.0000001);
  });

  it('draws the steppers as the 20x10 filled chevrons', () => {
    renderInput(5);
    for (const name of ['Increase value', 'Decrease value']) {
      // eslint-disable-next-line testing-library/no-node-access
      const glyph = screen.getByRole('button', { name }).querySelector('svg')!;
      expect(glyph).toHaveAttribute('width', '20');
      expect(glyph).toHaveAttribute('height', '10');
    }
  });
});
