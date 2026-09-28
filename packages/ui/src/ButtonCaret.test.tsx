import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ButtonCaret } from './ButtonCaret';
import { BUTTON_ICON_SIZES, getButtonIconSize } from './buttonIconSizes';

describe('ButtonCaret and buttonIconSizes', () => {
  it('resolves correct sizes for sm and md/lg', () => {
    expect(getButtonIconSize('sm')).toBe(16);
    expect(getButtonIconSize('md')).toBe(20);
    expect(getButtonIconSize('lg')).toBe(20);
    expect(getButtonIconSize(undefined)).toBe(BUTTON_ICON_SIZES.lg);
  });

  it('renders CaretDownIcon with sm dimensions', () => {
    render(<ButtonCaret size="sm" />);
    const icon = screen.getByTestId('CaretDownIcon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('size', '16');
    expect(icon).toHaveAttribute('weight', 'bold');
    expect(icon).toHaveClass('flex-shrink-0', 'rotate-toggle-180');
  });

  it('renders CaretDownIcon with default/lg dimensions', () => {
    render(<ButtonCaret size="lg" />);
    const icon = screen.getByTestId('CaretDownIcon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('size', '20');
    expect(icon).toHaveAttribute('weight', 'bold');
  });

  it('applies custom className and isOpen state', () => {
    render(<ButtonCaret isOpen className="ms-2" />);
    const icon = screen.getByTestId('CaretDownIcon');
    expect(icon).toHaveClass('ms-2', 'rotate-toggle-180');
    expect(icon).toHaveStyle({ transform: 'rotateZ(180deg)' });
  });
});
