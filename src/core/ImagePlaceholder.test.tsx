import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getPlaceholderFontSize, ImagePlaceholder } from './ImagePlaceholder';

describe('getPlaceholderFontSize', () => {
  it('returns 18 when size is undefined, empty, or invalid', () => {
    expect(getPlaceholderFontSize(undefined)).toBe(18);
    expect(getPlaceholderFontSize('')).toBe(18);
    expect(getPlaceholderFontSize('auto')).toBe(18);
    expect(getPlaceholderFontSize(0)).toBe(18);
  });

  it('calculates font size proportionally for numbers', () => {
    expect(getPlaceholderFontSize(16)).toBe(12);
    expect(getPlaceholderFontSize(24)).toBe(12);
    expect(getPlaceholderFontSize(28)).toBe(14);
    expect(getPlaceholderFontSize(32)).toBe(14);
    expect(getPlaceholderFontSize(40)).toBe(16);
    expect(getPlaceholderFontSize(48)).toBe(18);
    expect(getPlaceholderFontSize(56)).toBe(20);
    expect(getPlaceholderFontSize(64)).toBe(24);
    expect(getPlaceholderFontSize(100)).toBe(24);
  });

  it('calculates font size proportionally for px strings', () => {
    expect(getPlaceholderFontSize('24px')).toBe(12);
    expect(getPlaceholderFontSize('32px')).toBe(14);
    expect(getPlaceholderFontSize('40px')).toBe(16);
    expect(getPlaceholderFontSize('48px')).toBe(18);
    expect(getPlaceholderFontSize('56px')).toBe(20);
    expect(getPlaceholderFontSize('80px')).toBe(24);
  });
});

describe('ImagePlaceholder', () => {
  it('renders with default classes and inline styles', () => {
    render(<ImagePlaceholder>AB</ImagePlaceholder>);
    const element = screen.getByTestId('image-placeholder');

    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('AB');
    expect(element).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'shrink-0',
      'font-medium',
      'text-lg',
      'text-quaternary',
      'bg-tertiary',
      'rounded-lg',
    );
    expect(element).not.toHaveClass('rounded-full');
    expect(element.style.width).toBe('24px');
    expect(element.style.height).toBe('24px');
    expect(element.style.fontSize).toBe('12px');
  });

  it('renders with rounded-full when circle prop is true', () => {
    render(<ImagePlaceholder circle>AB</ImagePlaceholder>);
    const element = screen.getByTestId('image-placeholder');

    expect(element).toHaveClass('rounded-full');
    expect(element).not.toHaveClass('rounded-lg');
  });

  it('applies custom dimensions and proportional font size', () => {
    render(
      <ImagePlaceholder width="48px" height="48px" minWidth="48px">
        CD
      </ImagePlaceholder>,
    );
    const element = screen.getByTestId('image-placeholder');

    expect(element.style.width).toBe('48px');
    expect(element.style.height).toBe('48px');
    expect(element.style.minWidth).toBe('48px');
    expect(element.style.fontSize).toBe('18px');
  });

  it('applies custom background color', () => {
    render(<ImagePlaceholder backgroundColor="#123456">EF</ImagePlaceholder>);
    const element = screen.getByTestId('image-placeholder');

    expect(element.style.backgroundColor).toBe('rgb(18, 52, 86)');
  });

  it('merges custom className and style', () => {
    render(
      <ImagePlaceholder
        className="opacity-50"
        style={{ border: '1px solid red' }}
      >
        GH
      </ImagePlaceholder>,
    );
    const element = screen.getByTestId('image-placeholder');

    expect(element).toHaveClass('opacity-50');
    expect(element.style.border).toBe('1px solid red');
  });

  it('forwards custom data-testid and other HTML attributes', () => {
    render(
      <ImagePlaceholder
        data-testid="custom-placeholder"
        aria-label="Placeholder avatar"
      >
        IJ
      </ImagePlaceholder>,
    );
    const element = screen.getByTestId('custom-placeholder');

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-label', 'Placeholder avatar');
  });
});
