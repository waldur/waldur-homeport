import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CategoryThumbnail } from './CategoryThumbnail';

describe('CategoryThumbnail', () => {
  it('renders CubeIcon fallback when icon is not provided', () => {
    render(<CategoryThumbnail title="Compute" />);
    expect(screen.getByTestId('CubeIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('category-thumbnail')).not.toBeInTheDocument();
  });

  it('defaults to square shape (rounded-md) when icon is provided without circle prop', () => {
    render(
      <CategoryThumbnail title="Compute" icon="https://example.com/icon.png" />,
    );
    const avatar = screen.getByTestId('category-thumbnail');
    expect(avatar).toHaveClass('rounded-md');
    expect(avatar).not.toHaveClass('rounded-full');
  });

  it('renders circle shape (rounded-full) when circle prop is passed', () => {
    render(
      <CategoryThumbnail
        title="Storage"
        icon="https://example.com/icon.png"
        circle
      />,
    );
    const avatar = screen.getByTestId('category-thumbnail');
    expect(avatar).toHaveClass('rounded-full');
    expect(avatar).not.toHaveClass('rounded-md');
  });

  it('renders square shape when shape="square" is explicitly passed', () => {
    render(
      <CategoryThumbnail
        title="Network"
        icon="https://example.com/icon.png"
        shape="square"
      />,
    );
    const avatar = screen.getByTestId('category-thumbnail');
    expect(avatar).toHaveClass('rounded-md');
    expect(avatar).not.toHaveClass('rounded-full');
  });
});
