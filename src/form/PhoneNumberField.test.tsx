import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { PhoneNumberField } from './PhoneNumberField';

describe('PhoneNumberField', () => {
  const createMockInput = (value = '') => ({
    name: 'phone',
    value,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  });

  it('renders the component with phone icon', () => {
    const mockInput = createMockInput();
    render(<PhoneNumberField input={mockInput as any} meta={{} as any} />);

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'tel');
  });

  it('renders with placeholder', () => {
    const mockInput = createMockInput();
    render(
      <PhoneNumberField
        input={mockInput as any}
        meta={{} as any}
        placeholder="Enter phone"
      />,
    );

    const inputElement = screen.getByPlaceholderText('Enter phone');
    expect(inputElement).toBeInTheDocument();
  });

  it('formats phone number on blur', async () => {
    const user = userEvent.setup();
    const mockInput = createMockInput('+12025551234');
    render(<PhoneNumberField input={mockInput as any} meta={{} as any} />);

    const inputElement = screen.getByRole('textbox');
    inputElement.focus();
    await user.tab();

    expect(mockInput.onChange).toHaveBeenCalledWith('+1 202 555 1234');
    expect(mockInput.onBlur).toHaveBeenCalled();
  });

  it('does not call onChange if formatted value is same as input', async () => {
    const user = userEvent.setup();
    const mockInput = createMockInput('+1 202 555 1234');
    render(<PhoneNumberField input={mockInput as any} meta={{} as any} />);

    const inputElement = screen.getByRole('textbox');
    inputElement.focus();
    await user.tab();

    // onChange should not be called since value didn't change
    expect(mockInput.onChange).not.toHaveBeenCalled();
    expect(mockInput.onBlur).toHaveBeenCalled();
  });

  it('handles empty value on blur', async () => {
    const user = userEvent.setup();
    const mockInput = createMockInput('');
    render(<PhoneNumberField input={mockInput as any} meta={{} as any} />);

    const inputElement = screen.getByRole('textbox');
    inputElement.focus();
    await user.tab();

    // formatPhoneNumber returns null for empty, so onChange should not be called
    expect(mockInput.onChange).not.toHaveBeenCalled();
    expect(mockInput.onBlur).toHaveBeenCalled();
  });

  it('applies solid class when solid prop is true', () => {
    const mockInput = createMockInput();
    render(
      <PhoneNumberField input={mockInput as any} meta={{} as any} solid />,
    );

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('form-control-solid');
  });
});
