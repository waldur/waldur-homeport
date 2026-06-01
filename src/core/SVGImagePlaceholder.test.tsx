import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  generateSvgPlaceholder,
  SVGImagePlaceholder,
} from './SVGImagePlaceholder';

describe('generateSvgPlaceholder', () => {
  it('returns a data URI string', () => {
    const result = generateSvgPlaceholder();
    expect(result).toMatch(/^data:image\/svg\+xml/);
  });

  it('reflects custom width and height', () => {
    const result = generateSvgPlaceholder({ width: 400, height: 200 });
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain('width="400"');
    expect(decoded).toContain('height="200"');
  });

  it('reflects custom colors', () => {
    const result = generateSvgPlaceholder({
      bgColor: '#ff0000',
      textColor: '#00ff00',
    });
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain('fill="#ff0000"');
    expect(decoded).toContain('fill="#00ff00"');
  });
});

describe('SVGImagePlaceholder', () => {
  it('renders an img tag with a data URI src', () => {
    render(<SVGImagePlaceholder width={100} height={100} />);
    const img = screen.getByRole('img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
    expect(img.getAttribute('alt')).toBe('Placeholder');
  });
});
