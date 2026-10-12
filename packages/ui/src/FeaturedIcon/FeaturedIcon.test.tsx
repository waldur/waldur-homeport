import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { FeaturedIcon } from './FeaturedIcon';

describe('FeaturedIcon', () => {
  const dummyIcon = <span data-testid="dummy-icon">Icon</span>;

  it('renders icon and default attributes correctly', () => {
    render(<FeaturedIcon icon={dummyIcon} data-testid="featured-icon" />);
    const el = screen.getByTestId('featured-icon');

    expect(screen.getByTestId('dummy-icon')).toBeInTheDocument();
    expect(el).toHaveAttribute('data-variant', 'success');
    expect(el).toHaveAttribute('data-tone', 'outline');
    expect(el).toHaveClass('featured-icon');
    expect(el).toHaveStyle({ width: '38px', height: '38px' });
  });

  it('forwards ref to HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FeaturedIcon ref={ref} icon={dummyIcon} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('featured-icon');
  });

  it('supports explicit tone="solid" and tone="outline"', () => {
    const { rerender } = render(
      <FeaturedIcon
        icon={dummyIcon}
        tone="solid"
        data-testid="featured-icon"
      />,
    );
    let el = screen.getByTestId('featured-icon');
    expect(el).toHaveAttribute('data-tone', 'solid');
    expect(el).toHaveStyle({ width: '40px', height: '40px' });

    rerender(
      <FeaturedIcon
        icon={dummyIcon}
        tone="outline"
        data-testid="featured-icon"
      />,
    );
    el = screen.getByTestId('featured-icon');
    expect(el).toHaveAttribute('data-tone', 'outline');
    expect(el).toHaveStyle({ width: '38px', height: '38px' });
  });

  it('applies variant attributes correctly', () => {
    const variants = [
      'primary',
      'success',
      'warning',
      'danger',
      'info',
      'neutral',
    ] as const;

    for (const variant of variants) {
      const { unmount } = render(
        <FeaturedIcon
          icon={dummyIcon}
          variant={variant}
          data-testid={`icon-${variant}`}
        />,
      );
      const el = screen.getByTestId(`icon-${variant}`);
      expect(el).toHaveAttribute('data-variant', variant);
      unmount();
    }
  });

  it('applies size scale correctly for outline and solid tones', () => {
    // sm outline: outer 34px
    const { rerender } = render(
      <FeaturedIcon
        icon={dummyIcon}
        size="sm"
        tone="outline"
        data-testid="sized-icon"
      />,
    );
    expect(screen.getByTestId('sized-icon')).toHaveStyle({
      width: '34px',
      height: '34px',
    });

    // sm solid: outer 32px
    rerender(
      <FeaturedIcon
        icon={dummyIcon}
        size="sm"
        tone="solid"
        data-testid="sized-icon"
      />,
    );
    expect(screen.getByTestId('sized-icon')).toHaveStyle({
      width: '32px',
      height: '32px',
    });

    // md alias for default (outline: 38px, solid: 40px)
    rerender(
      <FeaturedIcon
        icon={dummyIcon}
        size="md"
        tone="outline"
        data-testid="sized-icon"
      />,
    );
    expect(screen.getByTestId('sized-icon')).toHaveStyle({
      width: '38px',
      height: '38px',
    });

    // lg (outline: 42px, solid: 48px)
    rerender(
      <FeaturedIcon
        icon={dummyIcon}
        size="lg"
        tone="solid"
        data-testid="sized-icon"
      />,
    );
    expect(screen.getByTestId('sized-icon')).toHaveStyle({
      width: '48px',
      height: '48px',
    });

    // xl (outline: 46px, solid: 56px)
    rerender(
      <FeaturedIcon
        icon={dummyIcon}
        size="xl"
        tone="outline"
        data-testid="sized-icon"
      />,
    );
    expect(screen.getByTestId('sized-icon')).toHaveStyle({
      width: '46px',
      height: '46px',
    });
  });

  it('sets --featured-icon-svg-size on inner div', () => {
    render(<FeaturedIcon icon={dummyIcon} size="lg" />);
    const inner = screen.getByTestId('featured-icon-inner');
    expect(inner).toBeInTheDocument();
    expect(inner).toHaveStyle({
      width: '32px',
      height: '32px',
      '--featured-icon-svg-size': '24px',
    });
  });

  it('merges custom className and style props', () => {
    render(
      <FeaturedIcon
        icon={dummyIcon}
        className="custom-featured-icon"
        style={{ margin: '10px' }}
        data-testid="featured-icon"
      />,
    );
    const el = screen.getByTestId('featured-icon');
    expect(el).toHaveClass('featured-icon', 'custom-featured-icon');
    expect(el).toHaveStyle({ margin: '10px' });
  });
});
