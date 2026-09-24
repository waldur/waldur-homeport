import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BaseNumberField } from './NumberField';

const renderField = (value, props = {}) => {
  const onChange = vi.fn();
  const onBlur = vi.fn();
  render(
    <BaseNumberField
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      min={1}
      max={20}
      {...props}
    />,
  );
  return { input: screen.getByRole('spinbutton'), onChange, onBlur };
};

describe('BaseNumberField range handling', () => {
  it.each([[''], [undefined], [null]])(
    'leaves an empty field (%j) valid and empty on blur',
    (value) => {
      const { input, onChange, onBlur } = renderField(value);

      expect(input).not.toHaveClass('is-invalid');
      fireEvent.blur(input);
      expect(onChange).not.toHaveBeenCalled();
      expect(onBlur).toHaveBeenCalled();
    },
  );

  it('still clamps a value below the minimum on blur', () => {
    const { input, onChange } = renderField(0);

    expect(input).toHaveClass('is-invalid');
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('still clamps a value above the maximum on blur', () => {
    const { input, onChange } = renderField(50);

    expect(input).toHaveClass('is-invalid');
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('keeps a value in range as it is', () => {
    const { input, onChange } = renderField(5);

    expect(input).not.toHaveClass('is-invalid');
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
  });
});
