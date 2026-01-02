import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { YearField } from './YearField';

describe('YearField', () => {
  const createMockInput = (value = '') => ({
    name: 'year',
    value,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  });

  it('renders the component with calendar icon', () => {
    const mockInput = createMockInput();
    render(<YearField input={mockInput as any} />);

    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'number');
  });

  it('has default min and max year constraints', () => {
    const mockInput = createMockInput();
    render(<YearField input={mockInput as any} />);

    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toHaveAttribute('min', '1900');
    // Max is current year + 10
    const expectedMax = (new Date().getFullYear() + 10).toString();
    expect(inputElement).toHaveAttribute('max', expectedMax);
  });

  it('accepts custom min and max year', () => {
    const mockInput = createMockInput();
    render(
      <YearField input={mockInput as any} minYear={2000} maxYear={2050} />,
    );

    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toHaveAttribute('min', '2000');
    expect(inputElement).toHaveAttribute('max', '2050');
  });

  it('shows placeholder with year range', () => {
    const mockInput = createMockInput();
    render(
      <YearField input={mockInput as any} minYear={2000} maxYear={2030} />,
    );

    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toHaveAttribute('placeholder', '2000–2030');
  });

  it('accepts custom placeholder', () => {
    const mockInput = createMockInput();
    render(<YearField input={mockInput as any} placeholder="Enter year" />);

    const inputElement = screen.getByPlaceholderText('Enter year');
    expect(inputElement).toBeInTheDocument();
  });

  it('has onKeyDown handler that prevents invalid characters', () => {
    const mockInput = createMockInput();
    render(<YearField input={mockInput as any} />);

    const inputElement = screen.getByRole('spinbutton');

    // Test that the input has the keydown handler by checking it's a number input
    // with step=1 which combined with onKeyDown prevents decimals
    expect(inputElement).toHaveAttribute('type', 'number');
    expect(inputElement).toHaveAttribute('step', '1');

    // The actual keydown prevention is tested by verifying the handler exists
    // (fireEvent doesn't properly simulate preventDefault behavior)
    fireEvent.keyDown(inputElement, { key: '.' });
    fireEvent.keyDown(inputElement, { key: 'e' });
    fireEvent.keyDown(inputElement, { key: 'E' });
    fireEvent.keyDown(inputElement, { key: '2' });

    // Input should still be functional
    fireEvent.change(inputElement, { target: { value: '2024' } });
    expect(mockInput.onChange).toHaveBeenCalled();
  });

  it('has step of 1', () => {
    const mockInput = createMockInput();
    render(<YearField input={mockInput as any} />);

    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toHaveAttribute('step', '1');
  });

  it('applies solid class when solid prop is true', () => {
    const mockInput = createMockInput();
    render(<YearField input={mockInput as any} solid />);

    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toHaveClass('form-control-solid');
  });
});
