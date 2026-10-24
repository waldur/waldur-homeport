import { describe, expect, it, vi } from 'vitest';

import { createSearchControl } from './searchControl';

// The real leaflet-geosearch control, not a mock: without autocomplete it
// still clears a result list on submit.
const createControl = () => {
  const provider = { search: vi.fn(() => Promise.resolve([])) };
  const control = createSearchControl({
    provider: provider as any,
    autoComplete: false,
  });
  return { control, provider };
};

const press = (input: HTMLInputElement, type: string, key: string, keyCode) =>
  input.dispatchEvent(
    new KeyboardEvent(type, { key, keyCode, cancelable: true } as any),
  );

describe('createSearchControl without autocomplete', () => {
  it('submits a search once without throwing', async () => {
    const { control, provider } = createControl();

    await expect(control.onSubmit({ query: 'Tartu' })).resolves.not.toThrow();
    expect(provider.search).toHaveBeenCalledTimes(1);
    expect(provider.search).toHaveBeenCalledWith({ query: 'Tartu' });
  });

  it('searches once on Enter and not while typing', async () => {
    const { control, provider } = createControl();
    const { input } = control.searchElement;

    input.value = 'Tar';
    press(input, 'keyup', 'r', 82);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(provider.search).not.toHaveBeenCalled();

    press(input, 'keypress', 'Enter', 13);
    await vi.waitFor(() => expect(provider.search).toHaveBeenCalledTimes(1));
    expect(provider.search).toHaveBeenCalledWith({ query: 'Tar' });
  });
});
