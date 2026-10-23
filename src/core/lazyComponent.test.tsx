import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { lazyComponent } from './lazyComponent';

vi.mock('@/ErrorMessage', () => ({
  ErrorMessage: ({ error }) => <p>failed: {error.message}</p>,
}));

const Page = ({ label }: { label: string }) => <p>{label}</p>;

describe('lazyComponent', () => {
  it('renders a page whose chunk has loaded without suspending again', async () => {
    const loader = vi.fn(() => Promise.resolve({ default: Page }));
    const LazyPage = lazyComponent(loader);

    const first = render(<LazyPage label="Users" />);
    expect(await screen.findByText('Users')).toBeInTheDocument();
    first.unmount();

    // A route re-entered mounts a new instance: it must not show the spinner.
    render(<LazyPage label="Users" />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('shows the error for a chunk that failed and retries on the next mount', async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error('chunk gone'))
      .mockResolvedValue({ default: Page });
    const LazyPage = lazyComponent(loader);

    const first = render(<LazyPage label="Users" />);
    expect(await screen.findByText('failed: chunk gone')).toBeInTheDocument();
    first.unmount();

    render(<LazyPage label="Users" />);
    expect(await screen.findByText('Users')).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
