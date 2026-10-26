import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import {
  Avatar,
  AvatarGroup,
  getAcronym,
  getPlaceholderFontSize,
} from './Avatar';

describe('getAcronym', () => {
  it('extracts two-character uppercase initials from full names', () => {
    expect(getAcronym('Alice Cooper')).toBe('AC');
    expect(getAcronym('bob martin')).toBe('BM');
    expect(getAcronym('Charlie Davis Evans')).toBe('CD');
  });

  it('handles single-word names and edge cases', () => {
    expect(getAcronym('Diana')).toBe('D');
    expect(getAcronym('')).toBe('');
    expect(getAcronym(undefined)).toBe('');
    expect(getAcronym('?')).toBe('?');
  });
});

describe('getPlaceholderFontSize', () => {
  it('returns proportional font sizes aligning with Tailwind text scale', () => {
    expect(getPlaceholderFontSize(24)).toBe(10);
    expect(getPlaceholderFontSize(32)).toBe(12);
    expect(getPlaceholderFontSize('32px')).toBe(12);
    expect(getPlaceholderFontSize(40)).toBe(14);
    expect(getPlaceholderFontSize(48)).toBe(16);
    expect(getPlaceholderFontSize(56)).toBe(18);
    expect(getPlaceholderFontSize(64)).toBe(20);
    expect(getPlaceholderFontSize(100)).toBe(24);
  });
});

describe('Avatar shape and tone resolution', () => {
  it('defaults to circle unconditionally, with subtle tone when name is provided', () => {
    render(<Avatar name="John Doe" data-testid="avatar" />);
    const root = screen.getByTestId('avatar');
    const fallback = screen.getByText('JD');

    expect(root).toHaveClass('rounded-full');
    expect(fallback).toHaveClass('bg-tertiary', 'text-quaternary');
  });

  it('defaults to circle and brand tone when initials are provided without name', () => {
    render(<Avatar initials="MS" data-testid="avatar" />);
    const root = screen.getByTestId('avatar');
    const fallback = screen.getByText('MS');

    expect(root).toHaveClass('rounded-full');
    expect(fallback).toHaveClass('bg-brand-600', 'text-white');
  });

  it('allows explicit shape="square" or shape="circle" overrides', () => {
    render(
      <Avatar
        name="Alice Cooper"
        shape="square"
        data-testid="square-avatar-1"
      />,
    );
    expect(screen.getByTestId('square-avatar-1')).toHaveClass('rounded-md');

    render(<Avatar initials="AC" shape="circle" data-testid="circle-avatar" />);
    expect(screen.getByTestId('circle-avatar')).toHaveClass('rounded-full');
  });

  it('allows explicit tone overrides', () => {
    render(<Avatar name="Alice Cooper" tone="primary" />);
    const fallback = screen.getByText('AC');
    expect(fallback).toHaveClass('bg-brand-subtle', 'text-brand');
  });
});

describe('Avatar sizing and className precedence', () => {
  it('applies default size-8 without inline style when no size prop or class is passed', () => {
    render(<Avatar initials="MS" data-testid="avatar" />);
    const root = screen.getByTestId('avatar');

    expect(root).toHaveClass('size-8');
    expect(root.style.width).toBe('');
    expect(root.style.height).toBe('');
    expect(root.style.fontSize).toBe('');
  });

  it('applies inline width and height when size prop is passed without size classes', () => {
    render(<Avatar name="Alice Cooper" size={40} data-testid="avatar" />);
    const root = screen.getByTestId('avatar');

    expect(root.style.width).toBe('40px');
    expect(root.style.height).toBe('40px');
    expect(root.style.fontSize).toBe('14px');
  });

  it('allows className size-* to win over default sizing without inline override', () => {
    // Shell UserMenu.tsx:93 passes className="size-9"
    render(<Avatar className="size-9" initials="MS" data-testid="avatar" />);
    const root = screen.getByTestId('avatar');

    expect(root).toHaveClass('size-9');
    expect(root.style.width).toBe('');
    expect(root.style.height).toBe('');
  });

  it('allows arbitrary className sizing like me-[16.25px] size-[50px] to win', () => {
    // Shell UserMenu.tsx:152 passes className="me-[16.25px] size-[50px]"
    render(
      <Avatar
        className="me-[16.25px] size-[50px]"
        initials="MS"
        data-testid="avatar"
      />,
    );
    const root = screen.getByTestId('avatar');

    expect(root).toHaveClass('size-[50px]');
    expect(root.style.width).toBe('');
    expect(root.style.height).toBe('');
  });
});

describe('Avatar image and delay behavior', () => {
  it('renders image when loaded and falls back gracefully', async () => {
    // Mock window.Image to simulate successful load in jsdom
    const originalImage = window.Image;
    // @ts-expect-error Mocking Image for Radix UI useImageLoadingStatus
    window.Image = class extends originalImage {
      naturalWidth = 100;
      naturalHeight = 100;
      complete = true;
      set src(url: string) {
        super.src = url;
        setTimeout(() => {
          this.dispatchEvent(new Event('load'));
        }, 0);
      }
    };

    try {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          alt="User Avatar"
          name="John Doe"
        />,
      );

      const img = await screen.findByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(img).toHaveAttribute('alt', 'User Avatar');
      expect(img).toHaveClass('object-cover');
    } finally {
      window.Image = originalImage;
    }
  });

  it('applies object-contain when isContain={true}', async () => {
    const originalImage = window.Image;
    // @ts-expect-error Mocking Image for Radix UI useImageLoadingStatus
    window.Image = class extends originalImage {
      naturalWidth = 100;
      naturalHeight = 100;
      complete = true;
      set src(url: string) {
        super.src = url;
        setTimeout(() => {
          this.dispatchEvent(new Event('load'));
        }, 0);
      }
    };

    try {
      render(
        <Avatar
          src="https://example.com/logo.png"
          alt="Company Logo"
          isContain
        />,
      );

      const img = await screen.findByRole('img');
      expect(img).toHaveClass('object-contain');
    } finally {
      window.Image = originalImage;
    }
  });
});

describe('AvatarGroup', () => {
  it('renders children with appropriate spacing class', () => {
    render(
      <AvatarGroup spacing="md" data-testid="avatar-group">
        <Avatar initials="A" />
        <Avatar initials="B" />
      </AvatarGroup>,
    );
    const group = screen.getByTestId('avatar-group');
    expect(group).toHaveClass('flex', 'items-center', '-space-x-2');
  });

  it('supports spacing variants sm and lg', () => {
    render(
      <AvatarGroup spacing="sm" data-testid="group-sm">
        <Avatar initials="A" />
      </AvatarGroup>,
    );
    expect(screen.getByTestId('group-sm')).toHaveClass('-space-x-1.5');

    render(
      <AvatarGroup spacing="lg" data-testid="group-lg">
        <Avatar initials="A" />
      </AvatarGroup>,
    );
    expect(screen.getByTestId('group-lg')).toHaveClass('-space-x-3');
  });

  it('renders max items and displays overflow count badge', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar initials="A" />
        <Avatar initials="B" />
        <Avatar initials="C" />
        <Avatar initials="D" />
      </AvatarGroup>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('respects totalCount prop when items list is truncated', () => {
    render(
      <AvatarGroup max={2} totalCount={10}>
        <Avatar initials="A" />
        <Avatar initials="B" />
      </AvatarGroup>,
    );
    expect(screen.getByText('+8')).toBeInTheDocument();
  });

  it('forwards ref on AvatarGroup to underlying container div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AvatarGroup ref={ref}>
        <Avatar initials="A" />
      </AvatarGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('flex', 'items-center');
  });
});

describe('Avatar ref forwarding and custom children', () => {
  it('forwards ref to the underlying DOM element for Tooltip and Slot compatibility', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar initials="JD" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveClass('avatar');
  });

  it('renders custom children in fallback when provided', () => {
    render(
      <Avatar>
        <span data-testid="custom-icon">★</span>
      </Avatar>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders transparent fallback without brand color when no initials, name, or children are provided', () => {
    render(<Avatar />);
    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveClass('bg-transparent');
    expect(fallback).not.toHaveClass('bg-brand-600');
  });
});
