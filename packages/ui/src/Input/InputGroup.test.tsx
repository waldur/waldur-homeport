/* eslint-disable testing-library/no-node-access -- the group's own wrapper and its custom properties are what these tests check */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './Input';
import { InputGroup } from './InputGroup';

describe('InputGroup', () => {
  it('renders the input with its adornments', () => {
    render(
      <InputGroup start={<span>S</span>} end={<span>E</span>}>
        <Input aria-label="Field" />
      </InputGroup>,
    );
    expect(screen.getByRole('textbox', { name: 'Field' })).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('reserves room for an adornment through custom properties', () => {
    const { container } = render(
      <InputGroup end={<span>E</span>}>
        <Input aria-label="Field" />
      </InputGroup>,
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group.style.getPropertyValue('--input-end')).toBe('4px');
    expect(group.style.getPropertyValue('--input-start')).toBe('');
  });

  it('sets nothing without adornments', () => {
    const { container } = render(
      <InputGroup>
        <Input aria-label="Field" />
      </InputGroup>,
    );
    expect(
      (container.firstElementChild as HTMLElement).getAttribute('style'),
    ).toBeNull();
  });

  it('draws a warning icon, and reserves room for it, when invalid', () => {
    const { container } = render(
      <InputGroup invalid end={<span>E</span>}>
        <Input aria-label="Field" invalid />
      </InputGroup>,
    );
    expect(screen.getByTestId('WarningCircleIcon')).toBeInTheDocument();
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue(
        '--input-end',
      ),
    ).toBe('4px');
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('draws no icon when valid', () => {
    render(
      <InputGroup>
        <Input aria-label="Field" />
      </InputGroup>,
    );
    expect(screen.queryByTestId('WarningCircleIcon')).not.toBeInTheDocument();
  });
});
