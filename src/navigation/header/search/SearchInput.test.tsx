import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  const user = userEvent.setup();

  it('renders input with default placeholder and search icon', () => {
    render(<SearchInput query="" setQuery={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
    expect(screen.getByTestId('MagnifyingGlassIcon')).toBeInTheDocument();
  });

  it('renders custom placeholder when provided', () => {
    render(
      <SearchInput
        query=""
        setQuery={vi.fn()}
        placeholder="Search everything..."
      />,
    );

    expect(
      screen.getByPlaceholderText('Search everything...'),
    ).toBeInTheDocument();
  });

  it('shows shortcut hint when showShortcut is true and query is empty', () => {
    render(<SearchInput query="" setQuery={vi.fn()} showShortcut />);

    const kbd = screen.getByText(/Ctrl\+K|⌘K/);
    expect(kbd).toBeInTheDocument();
    expect(kbd.tagName).toBe('KBD');
  });

  it('hides shortcut hint when query is not empty', () => {
    render(<SearchInput query="waldur" setQuery={vi.fn()} showShortcut />);

    expect(screen.queryByText(/Ctrl\+K|⌘K/)).not.toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<SearchInput query="waldur" setQuery={vi.fn()} isLoading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Clear' }),
    ).not.toBeInTheDocument();
  });

  it('shows clear button when query is present and not loading', () => {
    render(<SearchInput query="waldur" setQuery={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('clears query, calls onClear and refocuses input on clear click', async () => {
    const setQuery = vi.fn();
    const onClear = vi.fn();

    render(
      <SearchInput query="waldur" setQuery={setQuery} onClear={onClear} />,
    );

    const clearBtn = screen.getByRole('button', { name: 'Clear' });
    await user.click(clearBtn);

    expect(setQuery).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('triggers onOpen on typing and calls setQuery', async () => {
    const setQuery = vi.fn();
    const onOpen = vi.fn();

    render(<SearchInput query="" setQuery={setQuery} onOpen={onOpen} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');

    expect(setQuery).toHaveBeenCalledWith('a');
    expect(onOpen).toHaveBeenCalled();
  });

  it('triggers onOpen on Enter or ArrowDown', async () => {
    const onOpen = vi.fn();

    render(<SearchInput query="" setQuery={vi.fn()} onOpen={onOpen} />);

    const input = screen.getByRole('textbox');
    input.focus();

    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(1);

    await user.keyboard('{ArrowDown}');
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('forwards ref to native input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchInput ref={ref} query="" setQuery={vi.fn()} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('prevents form submission on Enter', () => {
    render(<SearchInput query="" setQuery={vi.fn()} />);

    const form = screen.getByRole('search');
    const submitEvent = new Event('submit', {
      cancelable: true,
      bubbles: true,
    });
    form.dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
  });
});
