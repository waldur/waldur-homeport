import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { IconSquare } from './IconSquare';

describe('IconSquare', () => {
  it('renders a md square around its icon by default', () => {
    render(
      <IconSquare data-testid="square">
        <svg data-testid="icon" />
      </IconSquare>,
    );
    const square = screen.getByTestId('square');

    expect(square.tagName).toBe('DIV');
    expect(square).toHaveAttribute('data-slot', 'icon-square');
    expect(square).toHaveAttribute('data-size', 'md');
    expect(square).toHaveClass('p-2.25', 'rounded-lg');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('lets a caller colour pair replace the neutral one', () => {
    render(
      <IconSquare
        size="lg"
        className="bg-brand-subtle text-brand"
        data-testid="square"
      />,
    );
    const square = screen.getByTestId('square');

    expect(square).toHaveAttribute('data-size', 'lg');
    expect(square).toHaveClass('bg-brand-subtle', 'text-brand');
    expect(square).not.toHaveClass('bg-transparent', 'text-secondary');
  });

  it('draws on its child with asChild', () => {
    render(
      <IconSquare asChild>
        <button type="button">Upload</button>
      </IconSquare>,
    );
    const button = screen.getByRole('button', { name: 'Upload' });

    expect(button).toHaveAttribute('data-slot', 'icon-square');
    expect(button).toHaveClass('border', 'border-secondary');
  });

  it('forwards its ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<IconSquare ref={ref} />);

    expect(ref.current).toHaveAttribute('data-slot', 'icon-square');
  });
});
