import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('forwards ref to HTMLSpanElement', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Ref Badge</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toBe('Ref Badge');
  });

  it('applies default primary solid attributes', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const el = screen.getByTestId('badge');
    expect(el).toHaveAttribute('data-variant', 'primary');
    expect(el).toHaveAttribute('data-tone', 'solid');
    expect(el).toHaveClass('badge');
  });

  it('applies outline tone attributes', () => {
    render(
      <Badge variant="success" tone="outline" data-testid="badge">
        Outline
      </Badge>,
    );
    const el = screen.getByTestId('badge');
    expect(el).toHaveAttribute('data-variant', 'success');
    expect(el).toHaveAttribute('data-tone', 'outline');
    expect(el).toHaveClass('badge');
  });

  it('applies light tone attributes', () => {
    render(
      <Badge variant="warning" tone="light" data-testid="badge">
        Light
      </Badge>,
    );
    const el = screen.getByTestId('badge');
    expect(el).toHaveAttribute('data-variant', 'warning');
    expect(el).toHaveAttribute('data-tone', 'light');
    expect(el).toHaveClass('badge');
  });

  it('supports neutral variant', () => {
    render(
      <Badge variant="neutral" tone="outline" data-testid="neutral-badge">
        Neutral
      </Badge>,
    );
    const neutralEl = screen.getByTestId('neutral-badge');
    expect(neutralEl).toHaveAttribute('data-variant', 'neutral');
    expect(neutralEl).toHaveAttribute('data-tone', 'outline');
  });

  it('supports teal, orange, and rose variants', () => {
    render(
      <Badge variant="teal" tone="outline" data-testid="teal-badge">
        Teal
      </Badge>,
    );
    const tealEl = screen.getByTestId('teal-badge');
    expect(tealEl).toHaveAttribute('data-variant', 'teal');
    expect(tealEl).toHaveAttribute('data-tone', 'outline');

    render(
      <Badge variant="orange" data-testid="orange-badge">
        Orange
      </Badge>,
    );
    const orangeEl = screen.getByTestId('orange-badge');
    expect(orangeEl).toHaveAttribute('data-variant', 'orange');
    expect(orangeEl).toHaveAttribute('data-tone', 'solid');

    render(
      <Badge variant="rose" tone="light" data-testid="rose-badge">
        Rose
      </Badge>,
    );
    const roseEl = screen.getByTestId('rose-badge');
    expect(roseEl).toHaveAttribute('data-variant', 'rose');
    expect(roseEl).toHaveAttribute('data-tone', 'light');
  });

  it('applies shape classes correctly', () => {
    render(
      <Badge shape="pill" data-testid="pill-badge">
        Pill
      </Badge>,
    );
    expect(screen.getByTestId('pill-badge')).toHaveClass('rounded-full');

    render(
      <Badge shape="roundless" data-testid="roundless-badge">
        Roundless
      </Badge>,
    );
    expect(screen.getByTestId('roundless-badge')).toHaveClass('rounded-none');
  });

  it('renders leftIcon, rightIcon, and bullet', () => {
    render(
      <Badge
        variant="primary"
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
        hasBullet
        data-testid="badge"
      >
        Content
      </Badge>,
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders tooltip when tooltip prop is passed', () => {
    render(<Badge tooltip="Tooltip message">With Tooltip</Badge>);
    expect(screen.getByText('With Tooltip')).toBeInTheDocument();
  });

  it('renders circle shape badge correctly with size variants', () => {
    render(
      <Badge shape="circle" data-testid="circle-badge">
        !
      </Badge>,
    );
    const circleEl = screen.getByTestId('circle-badge');
    expect(circleEl).toHaveClass('badge');
    expect(circleEl).toHaveClass('rounded-full');
    expect(circleEl).toHaveClass('aspect-square');
    expect(circleEl).toHaveClass('justify-center');

    render(
      <Badge size="sm" shape="circle" data-testid="circle-sm-badge">
        !
      </Badge>,
    );
    const circleSmEl = screen.getByTestId('circle-sm-badge');
    expect(circleSmEl).toHaveClass('size-5');
  });

  it('renders onlyIcon badges with centered layout and correct size classes', () => {
    const { unmount } = render(
      <Badge
        variant="primary"
        leftIcon={<span data-testid="star">★</span>}
        onlyIcon
        data-testid="only-icon-badge"
      />,
    );
    const badgeEl = screen.getByTestId('only-icon-badge');
    expect(badgeEl).toHaveClass('aspect-square');
    expect(badgeEl).toHaveClass('justify-center');
    expect(badgeEl).toHaveClass('size-6');
    expect(badgeEl).toHaveClass('p-0');

    // Verify left-icon does NOT have mr-1 when there are no children
    expect(screen.getByTestId('badge-left-icon')).not.toHaveClass('mr-1');

    unmount();

    // When children are present, left-icon should have mr-1
    render(
      <Badge
        variant="primary"
        leftIcon={<span data-testid="star-with-text">★</span>}
      >
        With Text
      </Badge>,
    );
    expect(screen.getByTestId('badge-left-icon')).toHaveClass('mr-1');

    // Sizing variants with onlyIcon
    render(
      <Badge
        size="sm"
        leftIcon={<span>★</span>}
        onlyIcon
        data-testid="only-icon-sm"
      />,
    );
    expect(screen.getByTestId('only-icon-sm')).toHaveClass('size-5');

    render(
      <Badge
        size="lg"
        leftIcon={<span>★</span>}
        onlyIcon
        data-testid="only-icon-lg"
      />,
    );
    expect(screen.getByTestId('only-icon-lg')).toHaveClass('size-7');
  });
});
