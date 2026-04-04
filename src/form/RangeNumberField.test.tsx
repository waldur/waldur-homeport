import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { RangeNumberField } from './RangeNumberField';

describe('RangeNumberField', () => {
  const createMockInput = (value: any = {}) => ({
    value,
    onChange: vi.fn(),
  });

  it('renders two number inputs', () => {
    const mockInput = createMockInput();
    render(<RangeNumberField input={mockInput as any} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(2);
  });

  it('displays current min and max values', () => {
    const mockInput = createMockInput({ min: 5, max: 10 });
    render(<RangeNumberField input={mockInput as any} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(5);
    expect(inputs[1]).toHaveValue(10);
  });

  it('calls onChange with min when min field changes', () => {
    const mockInput = createMockInput();
    render(<RangeNumberField input={mockInput as any} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '5' } });

    expect(mockInput.onChange).toHaveBeenCalledWith({ min: 5 });
  });

  it('calls onChange with max when max field changes', () => {
    const mockInput = createMockInput();
    render(<RangeNumberField input={mockInput as any} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], { target: { value: '10' } });

    expect(mockInput.onChange).toHaveBeenCalledWith({ max: 10 });
  });

  it('calls onChange with both min and max', () => {
    const mockInput = createMockInput({ min: 5 });
    render(<RangeNumberField input={mockInput as any} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], { target: { value: '10' } });

    expect(mockInput.onChange).toHaveBeenCalledWith({ min: 5, max: 10 });
  });

  it('calls onChange with undefined when both fields are cleared', () => {
    const mockInput = createMockInput({ min: 5 });
    render(<RangeNumberField input={mockInput as any} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '' } });

    expect(mockInput.onChange).toHaveBeenCalledWith(undefined);
  });

  it('handles null input value gracefully', () => {
    const mockInput = createMockInput(null);
    render(<RangeNumberField input={mockInput as any} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(null);
    expect(inputs[1]).toHaveValue(null);
  });
});
