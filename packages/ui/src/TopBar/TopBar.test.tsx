import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('renders a banner marked data-slot="top-bar"', () => {
    render(<TopBar left={<span>Logo</span>} />);
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('data-slot', 'top-bar');
    expect(header).toContainElement(screen.getByText('Logo'));
  });
});
