import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrandName } from './BrandName';

const mockSetLayout = vi.fn();
let mockLayoutConfig = {
  aside: { minimized: false },
};

vi.mock('@/metronic/layout/core', () => ({
  useLayout: () => ({
    config: mockLayoutConfig,
    setLayout: mockSetLayout,
  }),
}));

vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [] }),
}));

vi.mock('@/core/Link', () => ({
  Link: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/core/api', () => ({
  getIconUrl: vi.fn(),
}));

describe('BrandName minimizer toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLayoutConfig = {
      aside: { minimized: false },
    };
  });

  it('renders with aria-pressed="false" when sidebar is expanded', () => {
    render(<BrandName />);
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('id', 'kt_aside_toggle');
  });

  it('toggles sidebar minimization when clicked', async () => {
    const user = userEvent.setup();
    render(<BrandName />);
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' });

    await user.click(toggle);

    expect(mockSetLayout).toHaveBeenCalledWith({
      aside: {
        minimized: true,
      },
    });
  });

  it('renders with aria-pressed="true" and Expand label when sidebar is minimized', () => {
    mockLayoutConfig = {
      aside: { minimized: true },
    };
    render(<BrandName />);
    const toggle = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });
});
