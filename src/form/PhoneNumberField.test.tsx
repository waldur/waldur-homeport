import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { PhoneNumberField } from './PhoneNumberField';

vi.mock('@/core/utils', () => ({
  formatPhoneNumber: (value: string) => {
    if (!value) return null;
    // Simple mock: just add spaces for testing
    const cleaned = value.replace(/[\s\-().]/g, '');
    if (cleaned.startsWith('+1')) {
      return `+1 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`.trim();
    }
    return cleaned;
  },
}));

describe('PhoneNumberField', () => {
  const createMockInput = (value = '') => ({
    name: 'phone',
    value,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  });

  it('renders the component with phone icon', () => {
    const mockInput = createMockInput();
    render(<PhoneNumberField input={mockInput as any} />);

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'tel');
  });

  it('renders with placeholder', () => {
    const mockInput = createMockInput();
    render(
      <PhoneNumberField input={mockInput as any} placeholder="Enter phone" />,
    );

    const inputElement = screen.getByPlaceholderText('Enter phone');
    expect(inputElement).toBeInTheDocument();
  });

  it('formats phone number on blur', () => {
    const mockInput = createMockInput('+12025551234');
    render(<PhoneNumberField input={mockInput as any} />);

    const inputElement = screen.getByRole('textbox');
    fireEvent.blur(inputElement);

    expect(mockInput.onChange).toHaveBeenCalledWith('+1 202 555 1234');
    expect(mockInput.onBlur).toHaveBeenCalled();
  });

  it('does not call onChange if formatted value is same as input', () => {
    const mockInput = createMockInput('+1 202 555 1234');
    render(<PhoneNumberField input={mockInput as any} />);

    const inputElement = screen.getByRole('textbox');
    fireEvent.blur(inputElement);

    // onChange should not be called since value didn't change
    expect(mockInput.onChange).not.toHaveBeenCalled();
    expect(mockInput.onBlur).toHaveBeenCalled();
  });

  it('handles empty value on blur', () => {
    const mockInput = createMockInput('');
    render(<PhoneNumberField input={mockInput as any} />);

    const inputElement = screen.getByRole('textbox');
    fireEvent.blur(inputElement);

    // formatPhoneNumber returns null for empty, so onChange should not be called
    expect(mockInput.onChange).not.toHaveBeenCalled();
    expect(mockInput.onBlur).toHaveBeenCalled();
  });

  it('applies solid class when solid prop is true', () => {
    const mockInput = createMockInput();
    render(<PhoneNumberField input={mockInput as any} solid />);

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('form-control-solid');
  });
});
