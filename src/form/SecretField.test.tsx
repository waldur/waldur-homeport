import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SecretField } from './SecretField';

// Mock translation function
vi.mock('@/i18n', () => ({
  translate: (text: string) => text,
}));

describe('SecretField', () => {
  const defaultProps = {
    input: {
      name: 'test-input',
      value: '',
      onChange: vi.fn(),
    },
    placeholder: 'Enter your password',
  } as any;

  it('renders the component correctly', () => {
    render(<SecretField {...defaultProps} />);

    // Check if the input field is rendered
    const inputElement = screen.getByPlaceholderText('Enter your password');
    expect(inputElement).toBeInTheDocument();

    // Check if the button is rendered
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeInTheDocument();
  });

  it('toggles password visibility when button is clicked', () => {
    render(<SecretField {...defaultProps} />);

    const inputElement = screen.getByPlaceholderText(
      'Enter your password',
    ) as HTMLInputElement;
    const buttonElement = screen.getByRole('button');

    // Initially, the input should be of type "password"
    expect(inputElement.type).toBe('password');

    // Click the button to toggle visibility
    fireEvent.click(buttonElement);

    // Input type should change to "text"
    expect(inputElement.type).toBe('text');

    // Click again to toggle back
    fireEvent.click(buttonElement);

    // Input type should revert to "password"
    expect(inputElement.type).toBe('password');
  });
});
