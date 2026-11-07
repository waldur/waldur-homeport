import { act, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { lazyComponent } from './lazyComponent';

vi.mock('@/core/LoadingSpinner', () => ({
  LoadingSpinner: () => <div>loading</div>,
}));

vi.mock('@/ErrorMessage', () => ({
  ErrorMessage: ({ error }) => <p>failed: {error.message}</p>,
}));

const Page = () => <div>page</div>;

const LabelledPage = ({ label }: { label: string }) => <p>{label}</p>;

describe('lazyComponent', () => {
  it('loads on the first mount, and renders at once on every later one', async () => {
    const loader = vi.fn(() => Promise.resolve({ default: Page }));
    const Lazy = lazyComponent(loader);

    const first = render(<Lazy />);
    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(await screen.findByText('page')).toBeInTheDocument();
    first.unmount();

    // A route re-entered mounts a new instance: it must not show the spinner.
    render(<Lazy />);
    expect(screen.getByText('page')).toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('preloads, so even the first mount needs no spinner', async () => {
    const Lazy = lazyComponent(() => Promise.resolve({ default: Page }));
    await Lazy.preload();
    render(<Lazy />);
    expect(screen.getByText('page')).toBeInTheDocument();
  });

  it('shows the error for a chunk that failed and retries on the next mount', async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error('chunk gone'))
      .mockResolvedValue({ default: LabelledPage });
    const LazyPage = lazyComponent(loader);

    const first = render(<LazyPage label="Users" />);
    expect(await screen.findByText('failed: chunk gone')).toBeInTheDocument();
    first.unmount();

    render(<LazyPage label="Users" />);
    expect(await screen.findByText('Users')).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('keeps the page it loaded mounted when it renders again', async () => {
    // A page that counts its mounts and holds state of its own.
    const mounts = vi.fn();
    const Counting = ({ label }: { label: string }) => {
      const [clicked, setClicked] = useState(false);
      useEffect(() => mounts(), []);
      return (
        <button onClick={() => setClicked(true)}>
          {label} {clicked ? 'clicked' : 'fresh'}
        </button>
      );
    };
    const Lazy = lazyComponent(() => Promise.resolve({ default: Counting }));

    const view = render(<Lazy label="a" />);
    const button = await screen.findByRole('button');
    act(() => button.click());
    // The loader renders again once the chunk is in -- as the layout's
    // does whenever its parent does.
    view.rerender(<Lazy label="b" />);

    expect(screen.getByRole('button')).toHaveTextContent('b clicked');
    expect(mounts).toHaveBeenCalledTimes(1);
  });
});
