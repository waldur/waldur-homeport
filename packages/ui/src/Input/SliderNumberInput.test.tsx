import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormField, FormLabel } from '../Form';

import { SliderNumberInput } from './SliderNumberInput';

const renderSlider = (value, props = {}) => {
  const onValueChange = vi.fn();
  render(
    <FormField controlId="cores">
      <FormLabel>Cores</FormLabel>
      <SliderNumberInput
        value={value}
        onValueChange={onValueChange}
        min={1}
        max={16}
        {...props}
      />
    </FormField>,
  );
  return {
    field: screen.getByRole('spinbutton'),
    // aria-hidden: the slider is found only with hidden elements included.
    slider: screen.getByRole('slider', { hidden: true }),
    onValueChange,
  };
};

describe('SliderNumberInput', () => {
  it('names the number field with the label, not the slider', () => {
    const { field, slider } = renderSlider(4);
    expect(screen.getByLabelText('Cores')).toBe(field);
    expect(field).toHaveAttribute('id', 'cores');
    expect(slider).not.toHaveAttribute('id');
  });

  it('keeps the slider out of the tab order and the accessibility tree', () => {
    const { slider } = renderSlider(4);
    expect(slider).toHaveAttribute('aria-hidden', 'true');
    expect(slider).toHaveAttribute('tabindex', '-1');
  });

  it('reports a slider move as a number', () => {
    const { slider, onValueChange } = renderSlider(4);
    // eslint-disable-next-line testing-library/prefer-user-event -- user-event cannot drag a range thumb
    fireEvent.change(slider, { target: { value: '9' } });
    expect(onValueChange).toHaveBeenCalledWith(9);
  });

  it.each([
    ['', '1'],
    [null, '1'],
    [40, '16'],
    [8, '8'],
  ])('puts the slider for %j at %s', (value, position) => {
    const { slider } = renderSlider(value);
    expect(slider).toHaveValue(position);
  });

  it('lets the field be cleared', () => {
    const { field, onValueChange } = renderSlider(4);
    // eslint-disable-next-line testing-library/prefer-user-event -- clearing a number input in one change
    fireEvent.change(field, { target: { value: '' } });
    expect(onValueChange).toHaveBeenCalledWith('');
  });

  it('disables the slider with the field', () => {
    const { field, slider } = renderSlider(4, { disabled: true });
    expect(field).toBeDisabled();
    expect(slider).toBeDisabled();
  });
});
