import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mermaid = vi.hoisted(() => ({
  registerIconPacks: vi.fn(),
  initialize: vi.fn(),
  parse: vi.fn(() => Promise.resolve(true)),
  render: vi.fn(() => Promise.resolve({ svg: '<svg></svg>' })),
}));
vi.mock('mermaid', () => ({ default: mermaid }));

const theme = vi.hoisted(() => ({ current: 'light' }));
vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: theme.current, toggleTheme: () => {} }),
}));

import { MermaidChart } from './MermaidChart';

const setTheme = (name: 'light' | 'dark') => {
  theme.current = name;
  // ThemeProvider's loadTheme() sets this synchronously, before the re-render.
  document.documentElement.setAttribute('data-theme', name);
};

const lastDarkMode = () =>
  mermaid.initialize.mock.calls.at(-1)?.[0].themeVariables.darkMode;

afterEach(() => {
  vi.clearAllMocks();
  setTheme('light');
  document.documentElement.removeAttribute('data-theme');
});

describe('MermaidChart', () => {
  it('renders the diagram with the current theme', async () => {
    setTheme('dark');
    render(<MermaidChart code="graph LR; A-->B" />);
    await waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(1));
    expect(lastDarkMode()).toBe(true);
  });

  it('configures Mermaid again and re-renders when the theme changes', async () => {
    setTheme('light');
    const { rerender } = render(<MermaidChart code="graph LR; A-->B" />);
    await waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(1));
    expect(lastDarkMode()).toBe(false);

    setTheme('dark');
    rerender(<MermaidChart code="graph LR; A-->B" />);
    await waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(2));
    expect(lastDarkMode()).toBe(true);
  });

  it('registers the icon pack once, however often it renders', async () => {
    const { rerender } = render(<MermaidChart code="graph LR; A-->B" />);
    setTheme('dark');
    rerender(<MermaidChart code="graph LR; A-->B" />);
    await waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(2));
    expect(mermaid.registerIconPacks.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it('ignores a render that finishes after the theme changed', async () => {
    let finishOld: (value: { svg: string }) => void = () => {};
    mermaid.render
      .mockImplementationOnce(
        () => new Promise((resolve) => (finishOld = resolve)),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ svg: '<p>new diagram</p>' }),
      );

    const { rerender } = render(<MermaidChart code="graph LR; A-->B" />);
    await waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(1));

    setTheme('dark');
    rerender(<MermaidChart code="graph LR; A-->B" />);
    expect(await screen.findByText('new diagram')).toBeInTheDocument();

    finishOld({ svg: '<p>old diagram</p>' });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByText('old diagram')).not.toBeInTheDocument();
    expect(screen.getByText('new diagram')).toBeInTheDocument();
  });
});
